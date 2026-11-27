import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import toast from 'react-hot-toast'
import { BeatLoader } from 'react-spinners'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import { generateExcelFile } from '../utils/excelHelper'
import { FaDownload } from 'react-icons/fa'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import styles from './CompanyListingDetails/CompanyListingDetails.module.css'
import ListPagination from '../components/ListPagination/ListPagination'
import {
  PAGE_SIZE,
  useDebouncedValue,
} from '../components/ListPagination/listPaging'
import {
  formatStatusCheckedAt,
  getPayoutDisplayState,
} from '../utils/payoutDisplay'

const STATUS_BADGES = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  READY_FOR_PAYMENT: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  STATUS_UNKNOWN: 'bg-gray-100 text-gray-800',
  EXPIRED: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
  AWAITING_VPA: 'bg-amber-100 text-amber-800',
  PAID: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
}

const STATUS_BADGE = 'inline-block px-2.5 py-0.5 rounded text-xs font-semibold'

const formatPayoutDate = (value) =>
  value ? new Date(value).toLocaleString('en-IN') : ''

const PROVIDER_LABELS = {
  HSBC_UPI: 'UPI',
  HSBC_IMPS: 'IMPS',
  HSBC_NEFT: 'NEFT',
}

const PROVIDER_BADGES = {
  HSBC_UPI: 'bg-purple-100 text-purple-800',
  HSBC_IMPS: 'bg-sky-100 text-sky-800',
  HSBC_NEFT: 'bg-teal-100 text-teal-800',
}

const RECEIPT_BADGES = {
  COMPLETED: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  FAILED: 'bg-red-100 text-red-800',
  NOT_READY: 'bg-gray-100 text-gray-800',
}

const RECEIPT_LABELS = {
  COMPLETED: 'Emailed',
  PROCESSING: 'Generating',
  FAILED: 'Failed',
  NOT_READY: 'Not ready',
}

const TD_CLASS =
  'px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'
const TH_CLASS =
  'px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'
const TABLE_HEADERS = [
  'Lead',
  'Store / Sales Person',
  'Amount',
  'Mode',
  'Status',
  'Approval',
  'Payout to',
  'Order / RRN',
  'Paid On',
  'Receipt',
  'Logistics',
  'Actions',
]

const canSendToLogistics = (item) =>
  item.status === 'SUCCESS' && !item.logistics?.lotId

const isBankTransfer = (item) =>
  ['HSBC_IMPS', 'HSBC_NEFT'].includes(item.provider)

const providerLabel = (item) => PROVIDER_LABELS[item.provider] || item.provider || '-'

const userLabel = (user) => user?.name || user?.email || ''

// Ordered lifecycle of a payout, built from the timestamps the API returns.
// Steps without a timestamp are omitted.
const buildTimeline = (item) =>
  [
    { label: 'Payout created', at: item.createdAt, by: userLabel(item.initiatedBy) },
    {
      label: `Payment link ${item.linkNotificationState === 'FAILED' ? 'failed to send' : 'sent to customer'}`,
      at: item.linkNotificationLastAttemptAt,
    },
    {
      label: isBankTransfer(item)
        ? 'Customer submitted bank details'
        : 'Customer submitted UPI ID',
      at: item.customerLinkSubmittedAt,
    },
    { label: 'UPI ID validated', at: item.vpaValidatedAt },
    {
      label: `Approval ${String(item.approval?.status || '').toLowerCase()}`,
      at: item.approval?.decidedAt,
      by: userLabel(item.approval?.decidedBy),
      note: item.approval?.remarks,
    },
    {
      label: 'Payment sent to HSBC',
      at: item.paymentClaimedAt,
      by: userLabel(item.paymentClaimedBy),
    },
    { label: 'Paid (confirmed by HSBC)', at: item.paidAt },
    { label: 'Payment failed', at: item.failedAt, note: item.statusMessage },
    { label: 'Receipt generated & emailed', at: item.receiptGeneratedAt },
    {
      label: `Success notification ${item.successNotificationState === 'FAILED' ? 'failed' : 'sent'}`,
      at: item.successNotificationLastAttemptAt,
    },
    { label: 'Last HSBC status check', at: item.lastStatusCheckedAt },
    {
      label: `Sent to logistics (${item.logistics?.lotCode || 'lot'})`,
      at: item.logistics?.assignedAt,
      by: userLabel(item.logistics?.assignedBy),
      note: item.logistics?.remarks,
    },
  ]
    .filter((step) => step.at)
    .sort((a, b) => new Date(a.at) - new Date(b.at))

const getResendLinkLabel = (item) => {
  if (item.status === 'FAILED') {
    return ['HSBC_IMPS', 'HSBC_NEFT'].includes(item.provider)
      ? 'Re-enter bank details'
      : 'Re-enter UPI'
  }
  if (item.linkNotificationState === 'FAILED') {
    return 'Retry Link'
  }
  return 'Send Link'
}

const shouldShowResendLink = (item) =>
  item.status === 'EXPIRED' ||
  item.status === 'FAILED' ||
  (item.status === 'AWAITING_VPA' && item.linkNotificationState !== 'DELIVERED')

const toExportRow = (item) => ({
  'Payout ID': item._id,
  Lead: item.leadId?.uniqueCode || item.leadId?._id || '',
  Store: item.storeId?.storeName || '',
  Amount: Number(item.amount || 0),
  Status: item.status,
  'Status Message': item.statusMessage || '',
  'Payment Mode': providerLabel(item),
  'Masked UPI': item.beneficiaryVpaMasked || '',
  'Masked Account': item.beneficiaryAccountMasked || '',
  'Sales Person': userLabel(item.initiatedBy),
  'Payment Sent By': userLabel(item.paymentClaimedBy),
  'Approval Required': item.approval?.required ? 'Yes' : 'No',
  'Approval Status': item.approval?.status || '',
  'Approval By': userLabel(item.approval?.decidedBy),
  'Approval Remarks': item.approval?.remarks || '',
  'Merchant Order Number': item.merchantOrderNo || '',
  'HSBC Reference': item.providerReferenceNo || '',
  RRN: item.providerTransactionRrn || '',
  'HSBC Code': item.providerResponseCode || '',
  'HSBC Status': item.providerStatus || '',
  'HSBC Message': item.providerMessage || '',
  Attempts: item.attempts?.length || 0,
  'Receipt State': item.receiptState || '',
  'Receipt Generated': formatPayoutDate(item.receiptGeneratedAt),
  Created: formatPayoutDate(item.createdAt),
  'Payment Sent': formatPayoutDate(item.paymentClaimedAt),
  Paid: formatPayoutDate(item.paidAt),
  Failed: formatPayoutDate(item.failedAt),
  'Logistics Lot': item.logistics?.lotCode || '',
  'Sent To Logistics': formatPayoutDate(item.logistics?.assignedAt),
  'Sent To Logistics By': userLabel(item.logistics?.assignedBy),
})

const LogisticsCell = ({ item }) => {
  if (item.logistics?.lotId) {
    return (
      <>
        <span className={`${STATUS_BADGE} bg-green-100 text-green-800`}>
          In Logistics
        </span>
        <p className='mt-1 text-xs font-medium text-gray-700'>
          {item.logistics.lotCode}
        </p>
        <p className='text-xs text-gray-500'>
          {formatPayoutDate(item.logistics.assignedAt)}
        </p>
      </>
    )
  }
  if (item.status === 'SUCCESS') {
    return (
      <span className={`${STATUS_BADGE} bg-amber-100 text-amber-800`}>
        Not sent
      </span>
    )
  }
  return '-'
}

LogisticsCell.propTypes = {
  item: PropTypes.object.isRequired,
}

const PayoutRow = ({
  item,
  index,
  busyId,
  onAction,
  onReject,
  onView,
  onSendToLogistics,
}) => (
  <tr className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
    <td className={TD_CLASS}>
      <p className='font-medium'>{item.leadId?.uniqueCode || item.leadId?._id}</p>
      <p className='text-xs text-gray-500'>{formatPayoutDate(item.createdAt)}</p>
    </td>
    <td className={TD_CLASS}>
      <p>{item.storeId?.storeName || '-'}</p>
      {item.initiatedBy && (
        <p className='text-xs text-gray-500'>{userLabel(item.initiatedBy)}</p>
      )}
    </td>
    <td className={TD_CLASS}>
      <span className='font-semibold'>₹{Number(item.amount).toFixed(2)}</span>
    </td>
    <td className={TD_CLASS}>
      <span
        className={`${STATUS_BADGE} ${
          PROVIDER_BADGES[item.provider] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {providerLabel(item)}
      </span>
    </td>
    <td className={TD_CLASS}>
      <span
        className={`${STATUS_BADGE} ${
          STATUS_BADGES[item.status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {getPayoutDisplayState(item).statusLabel}
      </span>
      {(item.providerResponseCode || item.providerStatus) && (
        <p className='mt-1 max-w-52 whitespace-normal text-xs text-gray-600'>
          HSBC: {[item.providerResponseCode, item.providerStatus].filter(Boolean).join(' / ')}
          {item.providerMessage ? ` — ${item.providerMessage}` : ''}
        </p>
      )}
      {item.status === 'FAILED' && item.statusMessage && (
        <p className='mt-1 max-w-52 whitespace-normal text-xs text-red-700'>
          {item.statusMessage}
        </p>
      )}
      {item.lastStatusCheckedAt && (
        <p className='mt-1 text-xs text-gray-500'>
          Checked: {formatStatusCheckedAt(item.lastStatusCheckedAt)}
        </p>
      )}
    </td>
    <td className={TD_CLASS}>
      {item.approval?.required ? (
        <>
          <p className='font-medium text-black'>{item.approval?.status || 'PENDING'}</p>
          {item.approval?.decidedBy && (
            <p className='text-xs text-gray-500'>by {userLabel(item.approval.decidedBy)}</p>
          )}
        </>
      ) : (
        'Not required'
      )}
    </td>
    <td className={TD_CLASS}>
      {isBankTransfer(item)
        ? item.beneficiaryAccountMasked || '-'
        : item.beneficiaryVpaMasked || '-'}
    </td>
    <td className={TD_CLASS}>
      <p className='font-medium'>{item.merchantOrderNo || '-'}</p>
      <p className='text-sm text-gray-500'>
        RRN: {item.providerTransactionRrn || '-'}
      </p>
    </td>
    <td className={TD_CLASS}>
      {item.paidAt ? (
        <>
          <p>{formatPayoutDate(item.paidAt)}</p>
          {item.paymentClaimedBy && (
            <p className='text-xs text-gray-500'>by {userLabel(item.paymentClaimedBy)}</p>
          )}
        </>
      ) : (
        '-'
      )}
    </td>
    <td className={TD_CLASS}>
      <span
        className={`${STATUS_BADGE} ${
          RECEIPT_BADGES[item.receiptState] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {RECEIPT_LABELS[item.receiptState] || item.receiptState || '-'}
      </span>
    </td>
    <td className={TD_CLASS}>
      <LogisticsCell item={item} />
    </td>
    <td className={TD_CLASS}>
      <PayoutActions
        item={item}
        busyId={busyId}
        onAction={onAction}
        onReject={onReject}
        onView={onView}
        onSendToLogistics={onSendToLogistics}
      />
    </td>
  </tr>
)

PayoutRow.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  busyId: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onSendToLogistics: PropTypes.func.isRequired,
}

const DetailField = ({ label, children }) => (
  <div>
    <p className='text-xs uppercase tracking-wide text-gray-500'>{label}</p>
    <p className='break-words font-medium text-gray-900'>{children || '-'}</p>
  </div>
)

DetailField.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const PayoutDetailsModal = ({ item, onClose }) => {
  if (!item) {
    return null
  }
  const timeline = buildTimeline(item)
  const attempts = item.attempts || []
  return (
    <div
      className='fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4'
      onClick={onClose}
    >
      <div
        className='max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-xl'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='text-xl font-semibold'>
              Payout {item.leadId?.uniqueCode || ''}
            </h2>
            <p className='text-sm text-gray-500'>ID: {item._id}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border px-3 py-1 text-sm'
          >
            Close
          </button>
        </div>

        <h3 className='mt-5 mb-2 font-semibold'>Summary</h3>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <DetailField label='Amount'>
            ₹{Number(item.amount || 0).toFixed(2)} {item.currency || 'INR'}
          </DetailField>
          <DetailField label='Payment mode'>{providerLabel(item)} (HSBC)</DetailField>
          <DetailField label='Status'>
            {getPayoutDisplayState(item).statusLabel}
          </DetailField>
          <DetailField label='Status message'>{item.statusMessage}</DetailField>
          <DetailField label='Store'>{item.storeId?.storeName}</DetailField>
          <DetailField label='Sales person'>{userLabel(item.initiatedBy)}</DetailField>
          <DetailField label={isBankTransfer(item) ? 'Bank account' : 'UPI ID'}>
            {isBankTransfer(item)
              ? item.beneficiaryAccountMasked
              : item.beneficiaryVpaMasked}
          </DetailField>
          <DetailField label='Payment sent by'>
            {userLabel(item.paymentClaimedBy)}
          </DetailField>
          <DetailField label='Paid on'>{formatPayoutDate(item.paidAt)}</DetailField>
        </div>

        <h3 className='mt-5 mb-2 font-semibold'>HSBC references</h3>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <DetailField label='Order number'>{item.merchantOrderNo}</DetailField>
          <DetailField label='RRN / UTR'>{item.providerTransactionRrn}</DetailField>
          <DetailField label='HSBC reference'>{item.providerReferenceNo}</DetailField>
          <DetailField label='HSBC transaction ID'>
            {item.providerTransactionId}
          </DetailField>
          <DetailField label='HSBC code / status'>
            {[item.providerResponseCode, item.providerStatus]
              .filter(Boolean)
              .join(' / ')}
          </DetailField>
          <DetailField label='HSBC message'>{item.providerMessage}</DetailField>
        </div>

        <h3 className='mt-5 mb-2 font-semibold'>Approval, receipt &amp; notifications</h3>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <DetailField label='Approval'>
            {item.approval?.required
              ? item.approval?.status || 'PENDING'
              : 'Not required'}
          </DetailField>
          <DetailField label='Approved / rejected by'>
            {userLabel(item.approval?.decidedBy)}
          </DetailField>
          <DetailField label='Approval remarks'>{item.approval?.remarks}</DetailField>
          <DetailField label='Receipt'>
            {RECEIPT_LABELS[item.receiptState] || item.receiptState}
          </DetailField>
          <DetailField label='Payment link to customer'>
            {item.linkNotificationState}
            {item.linkNotificationError ? ` — ${item.linkNotificationError}` : ''}
          </DetailField>
          <DetailField label='Success notification'>
            {item.successNotificationState}
          </DetailField>
          <DetailField label='Logistics'>
            {item.logistics?.lotCode
              ? `In logistics · ${item.logistics.lotCode}`
              : item.status === 'SUCCESS'
                ? 'Not sent yet'
                : 'Available after payment succeeds'}
          </DetailField>
          <DetailField label='Sent to logistics by'>
            {userLabel(item.logistics?.assignedBy)}
          </DetailField>
          <DetailField label='Sent to logistics on'>
            {formatPayoutDate(item.logistics?.assignedAt)}
          </DetailField>
        </div>

        <h3 className='mt-5 mb-2 font-semibold'>Timeline</h3>
        {timeline.length === 0 ? (
          <p className='text-sm text-gray-500'>No events yet.</p>
        ) : (
          <ol className='border-l-2 border-gray-300 pl-4'>
            {timeline.map((step) => (
              <li key={`${step.label}-${step.at}`} className='mb-3'>
                <p className='font-medium'>{step.label}</p>
                <p className='text-xs text-gray-500'>
                  {formatPayoutDate(step.at)}
                  {step.by ? ` · ${step.by}` : ''}
                </p>
                {step.note && <p className='text-xs text-gray-700'>{step.note}</p>}
              </li>
            ))}
          </ol>
        )}

        <h3 className='mt-5 mb-2 font-semibold'>HSBC attempts ({attempts.length})</h3>
        {attempts.length === 0 ? (
          <p className='text-sm text-gray-500'>No HSBC calls made yet.</p>
        ) : (
          <div className='overflow-x-auto rounded-md border'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-100'>
                <tr>
                  <th className='px-3 py-2 text-left'>Time</th>
                  <th className='px-3 py-2 text-left'>Outcome</th>
                  <th className='px-3 py-2 text-left'>HTTP</th>
                  <th className='px-3 py-2 text-left'>Code</th>
                  <th className='px-3 py-2 text-left'>Message</th>
                  <th className='px-3 py-2 text-left'>Reference</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, attemptIndex) => (
                  <tr key={attempt._id || attemptIndex} className='border-t align-top'>
                    <td className='px-3 py-2 whitespace-nowrap'>
                      {formatPayoutDate(attempt.attemptedAt)}
                    </td>
                    <td className='px-3 py-2'>{attempt.outcome || '-'}</td>
                    <td className='px-3 py-2'>{attempt.httpStatus || '-'}</td>
                    <td className='px-3 py-2'>{attempt.responseCode || '-'}</td>
                    <td className='px-3 py-2'>{attempt.responseMessage || '-'}</td>
                    <td className='px-3 py-2 break-all'>
                      {attempt.requestReference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

PayoutDetailsModal.propTypes = {
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}

const getActedRowId = (updated) =>
  updated && String(updated._id || updated.id || '')

const reconcileActedRow = (updated, updatedId, items) =>
  items.map((item) =>
    String(item._id) === updatedId
      ? {
          ...item,
          status: updated.status ?? item.status,
          statusMessage: updated.statusMessage ?? item.statusMessage,
          merchantOrderNo:
            updated.merchantOrderNo ?? item.merchantOrderNo,
          providerTransactionRrn:
            updated.providerTransactionRrn ?? item.providerTransactionRrn,
          providerStatus: updated.providerStatus ?? item.providerStatus,
          providerMessage: updated.providerMessage ?? item.providerMessage,
          providerResponseCode:
            updated.providerResponseCode ?? item.providerResponseCode,
          lastStatusCheckedAt:
            updated.lastStatusCheckedAt ?? item.lastStatusCheckedAt,
          paidAt: updated.paidAt ?? item.paidAt,
          failedAt: updated.failedAt ?? item.failedAt,
          paymentClaimedAt: updated.paymentClaimedAt ?? item.paymentClaimedAt,
          receiptState: updated.receiptState ?? item.receiptState,
          logistics: updated.logistics ?? item.logistics,
          // Keep the populated user objects from the list; action responses
          // carry approval.decidedBy as a bare id.
          approval: updated.approval
            ? {
                ...updated.approval,
                decidedBy: item.approval?.decidedBy ?? updated.approval.decidedBy,
              }
            : item.approval,
        }
      : item
  )

const PayoutActions = ({
  item,
  busyId,
  onAction,
  onReject,
  onView,
  onSendToLogistics,
}) => {
  const disabled = busyId === item._id
  return (
    <div className='flex justify-center gap-1.5 whitespace-nowrap'>
      <button
        type='button'
        onClick={() => onView(item)}
        className='border border-gray-500 text-gray-700 px-2 py-1 text-sm font-medium rounded-md'
      >
        View
      </button>
      {canSendToLogistics(item) && (
        <button
          type='button'
          disabled={disabled}
          onClick={() => onSendToLogistics(item)}
          title='Hand this device to the logistics team for pickup'
          className='bg-emerald-600 text-white px-2 py-1 text-sm font-medium rounded-md disabled:opacity-60'
        >
          Send to Logistics
        </button>
      )}
      {item.status === 'PENDING_APPROVAL' && (
        <>
          <button
            disabled={disabled}
            onClick={() => onAction(item._id, 'approval', { approved: true })}
            className='bg-green-600 text-white px-2 py-1 text-sm font-medium rounded-md disabled:opacity-60'
          >
            Approve
          </button>
          <button
            disabled={disabled}
            onClick={() => onReject(item)}
            className='bg-red-600 text-white px-2 py-1 text-sm font-medium rounded-md disabled:opacity-60'
          >
            Reject
          </button>
        </>
      )}
      {item.status === 'READY_FOR_PAYMENT' && (
        <button
          disabled={disabled}
          onClick={() => onAction(item._id, 'pay')}
          className='bg-primary text-white px-2 py-1 text-sm font-medium rounded-md disabled:opacity-60'
        >
          Make Payment
        </button>
      )}
      {['PROCESSING', 'STATUS_UNKNOWN'].includes(item.status) && (
        <button
          disabled={disabled}
          onClick={() => onAction(item._id, 'status')}
          className='border border-primary text-primary px-2 py-1 text-sm font-medium rounded-md disabled:opacity-60'
        >
          Check Status
        </button>
      )}
      {shouldShowResendLink(item) && (
        <button
          disabled={disabled}
          onClick={() => onAction(item._id, 'resend-link')}
          className='border border-primary text-primary px-2 py-1 text-sm font-medium rounded-md disabled:opacity-60'
        >
          {getResendLinkLabel(item)}
        </button>
      )}
    </div>
  )
}

PayoutActions.propTypes = {
  item: PropTypes.object.isRequired,
  busyId: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onSendToLogistics: PropTypes.func.isRequired,
}

const SendToLogisticsModal = ({ item, busy, onClose, onSubmit }) => {
  if (!item) {
    return null
  }
  return (
    <div className='fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-5 shadow-xl'>
        <h2 className='text-xl font-semibold'>Send device to logistics</h2>
        <p className='mt-2 text-sm text-gray-600'>
          The customer has been paid. This hands the device to the logistics team
          for pickup from the store. It will appear on the Logistics screen marked
          as <span className='font-medium'>Customer Payout</span>.
        </p>
        <dl className='mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-gray-50 p-3 text-sm'>
          <dt className='text-gray-500'>Lead</dt>
          <dd className='font-medium'>{item.leadId?.uniqueCode || '-'}</dd>
          <dt className='text-gray-500'>Store</dt>
          <dd className='font-medium'>{item.storeId?.storeName || '-'}</dd>
          <dt className='text-gray-500'>Amount paid</dt>
          <dd className='font-medium'>₹{Number(item.amount || 0).toFixed(2)}</dd>
          <dt className='text-gray-500'>Paid via</dt>
          <dd className='font-medium'>
            {providerLabel(item)} · {formatPayoutDate(item.paidAt) || '-'}
          </dd>
        </dl>
        <div className='mt-4 flex justify-end gap-2'>
          <button
            type='button'
            disabled={busy}
            onClick={onClose}
            className='rounded-md border px-4 py-2 disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={busy}
            onClick={onSubmit}
            className='rounded-md bg-emerald-600 px-4 py-2 text-white disabled:opacity-60'
          >
            {busy ? 'Sending…' : 'Send to Logistics'}
          </button>
        </div>
      </div>
    </div>
  )
}

SendToLogisticsModal.propTypes = {
  item: PropTypes.object,
  busy: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

const RejectPayoutModal = ({ item, remarks, setRemarks, busy, onClose, onSubmit }) => {
  if (!item) {
    return null
  }
  return (
    <div className='fixed inset-0 z-[60] grid place-items-center bg-black/50 px-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-5 shadow-xl'>
        <h2 className='text-xl font-semibold'>Reject customer payout</h2>
        <p className='mt-2 text-sm text-gray-600'>
          Enter the reason for rejecting {item.leadId?.uniqueCode || 'this payout'}.
          The customer and Sales Person will be notified.
        </p>
        <textarea
          value={remarks}
          onChange={(event) => setRemarks(event.target.value)}
          maxLength={250}
          rows={4}
          autoFocus
          className='mt-4 w-full rounded-md border border-gray-300 p-3'
          placeholder='Rejection remark (required)'
        />
        <p className='mt-1 text-right text-xs text-gray-500'>{remarks.length}/250</p>
        <div className='mt-4 flex justify-end gap-2'>
          <button
            type='button'
            disabled={busy}
            onClick={onClose}
            className='rounded-md border px-4 py-2 disabled:opacity-60'
          >
            Cancel
          </button>
          <button
            type='button'
            disabled={busy || !remarks.trim()}
            onClick={onSubmit}
            className='rounded-md bg-red-600 px-4 py-2 text-white disabled:opacity-60'
          >
            Reject payout
          </button>
        </div>
      </div>
    </div>
  )
}

RejectPayoutModal.propTypes = {
  item: PropTypes.object,
  remarks: PropTypes.string.isRequired,
  setRemarks: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

const PayoutManagement = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = PAGE_SIZE
  const [total, setTotal] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim())
  // Only the newest list request may update the table.
  const latestRequest = useRef(0)
  const [rejectingItem, setRejectingItem] = useState(null)
  const [rejectionRemarks, setRejectionRemarks] = useState('')
  const [viewingId, setViewingId] = useState('')
  const [logisticsItem, setLogisticsItem] = useState(null)
  const viewingItem = useMemo(
    () => items.find((item) => String(item._id) === viewingId) || null,
    [items, viewingId]
  )
  const token = sessionStorage.getItem('authToken')

  // Search and paging run on the server, over every payout the user may see.
  const listParams = useCallback(
    (pageNumber, pageSize) => ({
      page: pageNumber,
      limit: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [debouncedSearch]
  )

  const load = useCallback(async () => {
    const requestId = latestRequest.current + 1
    latestRequest.current = requestId
    const isStale = () => requestId !== latestRequest.current
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts`,
        { headers: { Authorization: token }, params: listParams(page, limit) }
      )
      if (isStale()) {
        return
      }
      const data = response.data.data
      const count = data.total || 0
      const lastPage = Math.max(Math.ceil(count / limit), 1)
      // The last row of the last page left the list (e.g. after an action).
      if (page > lastPage) {
        setPage(lastPage)
        return
      }
      setItems(data.items)
      setTotal(count)
      setError('')
    } catch (requestError) {
      if (!isStale()) {
        setError(requestError.response?.data?.message || 'Unable to load payouts')
      }
    } finally {
      if (!isStale()) {
        setLoading(false)
      }
    }
  }, [token, listParams, page, limit])

  // A new search starts again from the first page.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const action = async (id, path, body = {}) => {
    if (busyId) {
      return
    }
    setBusyId(id)
    setError('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts/${id}/${path}`,
        body,
        { headers: { Authorization: token } }
      )
      await load()
      // Reconcile the acted-on row from the authoritative response, so the
      // action buttons (e.g. Make Payment) update even if the list reload is
      // served stale/cached.
      const updated = response.data?.data
      const updatedId = getActedRowId(updated)
      if (updatedId) {
        setItems((prev) => reconcileActedRow(updated, updatedId, prev))
      }
      toast.success(response.data?.message || 'Payout updated')
      return true
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || 'Unable to update payout'
      setError(message)
      toast.error(message)
      return false
    } finally {
      setBusyId('')
    }
  }

  const openRejectModal = (item) => {
    setRejectingItem(item)
    setRejectionRemarks('')
  }

  const closeRejectModal = () => {
    if (!busyId) {
      setRejectingItem(null)
      setRejectionRemarks('')
    }
  }

  const rejectPayout = async () => {
    const remarks = rejectionRemarks.trim()
    if (!remarks) {
      toast.error('Rejection remark is required')
      return
    }
    const updated = await action(rejectingItem._id, 'approval', {
      approved: false,
      remarks,
    })
    if (updated) {
      setRejectingItem(null)
      setRejectionRemarks('')
    }
  }

  const openLogisticsModal = (item) => setLogisticsItem(item)

  const closeLogisticsModal = () => {
    if (!busyId) {
      setLogisticsItem(null)
    }
  }

  const sendToLogistics = async () => {
    const sent = await action(logisticsItem._id, 'send-to-logistics')
    if (sent) {
      setLogisticsItem(null)
    }
  }

  // Export every payout matching the search, not only the page on screen.
  const EXPORT_PAGE_SIZE = 100
  const EXPORT_MAX_PAGES = 50
  const exportPayouts = async () => {
    setLoading(true)
    try {
      const rows = []
      for (let pageNumber = 1; pageNumber <= EXPORT_MAX_PAGES; pageNumber += 1) {
        // Pages are fetched one after another on purpose (the next depends on the total).
        // eslint-disable-next-line no-await-in-loop
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts`,
          {
            headers: { Authorization: token },
            params: listParams(pageNumber, EXPORT_PAGE_SIZE),
          }
        )
        const { items: batch = [], total: count = 0 } = response.data.data
        rows.push(...batch.map(toExportRow))
        if (batch.length === 0 || rows.length >= count) {
          break
        }
      }
      generateExcelFile(rows, 'HSBC_Payouts_UAT')
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to export payouts')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await load()
    toast.success('Payouts refreshed')
  }

  return (
    <div>
      {loading && (
        <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <BeatLoader color='var(--primary-color)' size={15} />
        </div>
      )}

      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />

      <div className='pt-1 pb-2 px-4 md:pt-2 md:px-8'>
        <h1 className='text-3xl font-semibold'>Customer Payouts</h1>
        <p className='text-gray-600'>
          Approve, initiate and reconcile HSBC payouts (UPI, IMPS &amp; NEFT).
        </p>
      </div>

      {/* TOP FILTER BAR */}
      <div className='flex flex-wrap gap-2 items-center justify-center mt-2'>
        <div className={styles.search_bar_wrap}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='text-sm'
            placeholder='Search lead, store, order no, status...'
          />
          <IoMdSearch size={25} />
        </div>
        <button
          type='button'
          onClick={handleRefresh}
          title='Refresh'
          className={`${styles.icons_box} cursor-pointer border-0 hover:opacity-80`}
        >
          <IoRefresh size={25} />
        </button>
        <button
          type='button'
          onClick={exportPayouts}
          disabled={total === 0}
          className={`${styles.bulkdown_button} disabled:opacity-50`}
        >
          <FaDownload /> Export
        </button>
      </div>

      {error && <p className='m-4 text-red-600'>{error}</p>}

      <div className='m-2 md:m-5'>
        <div className='overflow-x-auto border border-gray-300 rounded-md'>
        <table className='w-full'>
          <thead className='bg-primary text-white'>
            <tr className='align-top'>
              {TABLE_HEADERS.map((header) => (
                <th key={header} className={TH_CLASS}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <PayoutRow
                key={item._id}
                item={item}
                index={index}
                busyId={busyId}
                onAction={action}
                onReject={openRejectModal}
                onView={(row) => setViewingId(String(row._id))}
                onSendToLogistics={openLogisticsModal}
              />
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className='p-8 text-center text-gray-500'>
                  No payouts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      <ListPagination
        page={page}
        pageSize={limit}
        total={total}
        disabled={loading}
        onPageChange={setPage}
      />
      <RejectPayoutModal
        item={rejectingItem}
        remarks={rejectionRemarks}
        setRemarks={setRejectionRemarks}
        busy={Boolean(busyId)}
        onClose={closeRejectModal}
        onSubmit={rejectPayout}
      />
      <SendToLogisticsModal
        item={logisticsItem}
        busy={Boolean(busyId)}
        onClose={closeLogisticsModal}
        onSubmit={sendToLogistics}
      />
      <PayoutDetailsModal item={viewingItem} onClose={() => setViewingId('')} />
    </div>
  )
}

export default PayoutManagement
