import { useState } from 'react'
import PropTypes from 'prop-types'

// Confirm Payment form for a store payment request, shared by Customer
// Payouts > Store Requests and Store Payments. Like the old Pickup "Confirm
// Payment": receipt file + remarks, plus an optional payment reference.

export const RECEIPT_MAX_MB = 10
const RECEIPT_ACCEPT = 'image/png,image/jpeg,application/pdf'

const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`

const ConfirmPaymentModal = ({ item, busy, error = '', onClose, onSubmit }) => {
  const [file, setFile] = useState(null)
  const [reference, setReference] = useState('')
  const [remarks, setRemarks] = useState('')
  const [fileError, setFileError] = useState('')

  if (!item) {
    return null
  }

  const pickFile = (event) => {
    const picked = event.target.files?.[0] || null
    setFileError('')
    if (picked && picked.size > RECEIPT_MAX_MB * 1024 * 1024) {
      setFileError(`The receipt must be ${RECEIPT_MAX_MB} MB or smaller`)
      setFile(null)
      return
    }
    setFile(picked)
  }

  return (
    <div className='fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-5 shadow-xl'>
        <h2 className='text-xl font-semibold'>Confirm payment</h2>
        <p className='mt-1 text-sm text-gray-600'>
          Record that the store has been paid for this request. The devices then
          go to Logistics for pickup.
        </p>
        <dl className='mt-4 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-gray-50 p-3 text-sm'>
          <dt className='text-gray-500'>Request</dt>
          <dd className='font-medium'>{item.uniqueCode}</dd>
          <dt className='text-gray-500'>Store</dt>
          <dd className='font-medium'>{item.storeId?.storeName || '-'}</dd>
          <dt className='text-gray-500'>Devices</dt>
          <dd className='font-medium'>{item.totalDevice}</dd>
          <dt className='text-gray-500'>Amount</dt>
          <dd className='font-medium'>{formatAmount(item.totalAmount)}</dd>
        </dl>

        <label className='mt-4 block text-sm font-medium'>
          Payment receipt (optional)
          <input
            type='file'
            accept={RECEIPT_ACCEPT}
            onChange={pickFile}
            className='mt-1 block w-full text-sm'
          />
        </label>
        <p className='mt-1 text-xs text-gray-500'>
          PDF, JPG or PNG up to {RECEIPT_MAX_MB} MB. Leave empty to generate a PDF receipt.
        </p>
        {fileError && <p className='mt-1 text-xs text-red-600'>{fileError}</p>}

        <label className='mt-3 block text-sm font-medium'>
          Payment reference (optional)
          <input
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            maxLength={100}
            placeholder='UTR / transaction number'
            className='mt-1 w-full rounded-md border border-gray-300 p-2 text-sm'
          />
        </label>
        <label className='mt-3 block text-sm font-medium'>
          Remarks (optional)
          <textarea
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            maxLength={250}
            rows={2}
            className='mt-1 w-full rounded-md border border-gray-300 p-2 text-sm'
          />
        </label>

        {error && (
          <p role='alert' className='mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700'>
            {error}
          </p>
        )}

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
            disabled={busy || Boolean(fileError)}
            onClick={() =>
              onSubmit({ file, reference: reference.trim(), remarks: remarks.trim() })
            }
            className='rounded-md bg-green-700 px-4 py-2 text-white disabled:opacity-60'
          >
            {busy ? 'Saving…' : 'Confirm payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

ConfirmPaymentModal.propTypes = {
  item: PropTypes.object,
  busy: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default ConfirmPaymentModal
