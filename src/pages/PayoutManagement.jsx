import { useCallback, useEffect, useMemo, useState } from 'react'
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
  Provider: item.provider || '',
  'Masked UPI': item.beneficiaryVpaMasked || '',
  'Masked Account': item.beneficiaryAccountMasked || '',
  'Approval Required': item.approval?.required ? 'Yes' : 'No',
  'Approval Status': item.approval?.status || '',
  'Merchant Order Number': item.merchantOrderNo || '',
  RRN: item.providerTransactionRrn || '',
  'Provider Message': item.providerMessage || '',
  Attempts: item.attempts?.length || 0,
  'Receipt State': item.receiptState || '',
  Created: formatPayoutDate(item.createdAt),
  Paid: formatPayoutDate(item.paidAt),
})

const PayoutRow = ({ item, index, busyId, onAction }) => (
  <tr className={index % 2 === 0 ? 'bg-gray-200' : 'bg-white'}>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      <p className='font-medium'>{item.leadId?.uniqueCode || item.leadId?._id}</p>
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      {item.storeId?.storeName || '-'}
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      <span className='font-semibold'>₹{Number(item.amount).toFixed(2)}</span>
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      <span
        className={`${STATUS_BADGE} ${
          STATUS_BADGES[item.status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {item.status.replaceAll('_', ' ')}
      </span>
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      {item.approval?.required ? (
        <p className='font-medium text-black'>{item.approval?.status || 'PENDING'}</p>
      ) : (
        'Not required'
      )}
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      {['HSBC_IMPS', 'HSBC_NEFT'].includes(item.provider)
        ? item.beneficiaryAccountMasked || '-'
        : item.beneficiaryVpaMasked || '-'}
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      <p className='font-medium'>{item.merchantOrderNo || '-'}</p>
      <p className='text-sm text-gray-500'>
        RRN: {item.providerTransactionRrn || '-'}
      </p>
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      {item.receiptState || '-'}
    </td>
    <td className='px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'>
      <PayoutActions item={item} busyId={busyId} onAction={onAction} />
    </td>
  </tr>
)

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
          receiptState: updated.receiptState ?? item.receiptState,
          approval: updated.approval ?? item.approval,
        }
      : item
  )

const PayoutActions = ({ item, busyId, onAction }) => {
  const disabled = busyId === item._id
  return (
    <div className='flex justify-center gap-1.5 whitespace-nowrap'>
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
            onClick={() => onAction(item._id, 'approval', { approved: false })}
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

const PayoutManagement = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [search, setSearch] = useState('')
  const token = sessionStorage.getItem('authToken')

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) {
      return items
    }
    return items.filter((item) => {
      const haystack = [
        item.leadId?.uniqueCode || item.leadId?._id || '',
        item.storeId?.storeName || '',
        item.status || '',
        item.provider || '',
        item.merchantOrderNo || '',
        item.providerTransactionRrn || '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [items, search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts`,
        { headers: { Authorization: token } }
      )
      setItems(response.data.data.items)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load payouts')
    } finally {
      setLoading(false)
    }
  }, [token])

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
    } catch (requestError) {
      const message =
        requestError.response?.data?.message || 'Unable to update payout'
      setError(message)
      toast.error(message)
    } finally {
      setBusyId('')
    }
  }

  const exportPayouts = () => {
    const rows = items.map(toExportRow)
    generateExcelFile(rows, 'HSBC_Payouts_UAT')
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
            placeholder='Search...'
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
          disabled={items.length === 0}
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
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Lead</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Store</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Amount</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Status</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Approve</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Payout to</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Order / RRN</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Receipt</th>
              <th className='px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <PayoutRow
                key={item._id}
                item={item}
                index={index}
                busyId={busyId}
                onAction={action}
              />
            ))}
            {!loading && filteredItems.length === 0 && (
              <tr>
                <td colSpan='9' className='p-8 text-center text-gray-500'>
                  No payouts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

export default PayoutManagement
