import { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import toast from 'react-hot-toast'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import ViewPickupTable from '../../components/ViewPickupTable/ViewPickupTable'
import ConfirmPaymentModal from './ConfirmPaymentModal'
import { USER_ROLES } from '../../constants/roleConstants'

// Store payment requests raised from Pickup & Cancel ("Request For Payment").
// Shows what the Picked Up tab and Store Payments showed, and lets the payer
// confirm payment with a receipt. Paid requests go to Logistics on their own.

const PAGE_SIZE = 10

const STATUS_LABELS = {
  PAYMENT_REQUESTED: 'Payment Requested',
  FLAGGED: 'Flagged',
  PROCESSING: 'Processing',
  PAYMENT_DONE: 'Payment Done',
}

const STATUS_BADGES = {
  PAYMENT_REQUESTED: 'bg-amber-100 text-amber-800',
  FLAGGED: 'bg-red-100 text-red-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  PAYMENT_DONE: 'bg-green-100 text-green-800',
}

const MODE_LABELS = {
  COMPANY_ACCOUNTS: 'Company Accounts',
  MANAGER_FUNDS: 'Manager Funds',
  PREPAID_DEFERRED: 'Pre-paid / Deferred',
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'PAYMENT_REQUESTED', label: 'Payment Requested' },
  { value: 'FLAGGED', label: 'Flagged' },
  { value: 'PAYMENT_DONE', label: 'Payment Done' },
]

const EMPTY_FILTERS = {
  search: '',
  storeId: '',
  region: '',
  status: '',
  fromDate: '',
  toDate: '',
}

const BADGE = 'inline-block px-2.5 py-0.5 rounded text-xs font-semibold'
const TD = 'px-4 py-2 text-sm text-center md:px-6 md:py-3 md:text-base whitespace-nowrap'
const TH = 'px-4 py-2 text-sm font-medium md:px-6 md:py-3 md:text-base whitespace-nowrap text-center'
const FIELD = 'h-10 rounded-md border border-gray-300 bg-white px-3 text-sm'
const HEADERS = [
  'Request',
  'Store',
  'Location',
  'Devices',
  'Amount',
  'Mode',
  'Status',
  'Requested By',
  'Paid',
  'Actions',
]

const endpoint = (path = '') =>
  `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store-payments${path}`

const formatDate = (value) => (value ? new Date(value).toLocaleString('en-IN') : '')
const formatAmount = (value) => `₹${Number(value || 0).toFixed(2)}`
const userName = (user) =>
  user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || ''
const isUrl = (value) => /^https?:\/\//i.test(String(value || ''))

// Same rule as the backend (assertPaymentActor).
const canMarkPaid = (role, item) =>
  role === USER_ROLES.SUPER_ADMIN ||
  (role === USER_ROLES.ACCOUNTS_USER && item.paymentMode === 'COMPANY_ACCOUNTS') ||
  (role === USER_ROLES.MANAGER && item.paymentMode === 'MANAGER_FUNDS')

const effectiveQuery = (filters, page) => {
  const hasRange = Boolean(filters.fromDate && filters.toDate)
  const query = {
    requestsOnly: 'true',
    withStores: 'true',
    page,
    limit: PAGE_SIZE,
  }
  ;['search', 'storeId', 'region', 'status'].forEach((key) => {
    if (filters[key]) {
      query[key] = filters[key]
    }
  })
  if (hasRange) {
    query.fromDate = filters.fromDate
    query.toDate = filters.toDate
  }
  return query
}

/* --------------------------------- Filters -------------------------------- */

const Filters = ({ filters, stores, onChange, onClear, onRefresh }) => {
  const [searchInput, setSearchInput] = useState(filters.search)
  useEffect(() => setSearchInput(filters.search), [filters.search])

  const regions = useMemo(
    () => [...new Set(stores.map((store) => store.region).filter(Boolean))].sort(),
    [stores]
  )
  const storeOptions = filters.region
    ? stores.filter((store) => store.region === filters.region)
    : stores
  const hasFilters = Object.values(filters).some(Boolean)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onChange({ search: searchInput.trim() })
      }}
      className='mx-2 mt-3 flex flex-wrap items-end justify-center gap-2 md:mx-5'
    >
      <label className='flex flex-col text-xs text-gray-600'>
        Lot number
        <div className='flex'>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder='LOT-…'
            className={`${FIELD} rounded-r-none`}
          />
          <button
            type='submit'
            aria-label='Search'
            className='h-10 rounded-r-md bg-primary px-3 text-white'
          >
            <IoMdSearch size={20} />
          </button>
        </div>
      </label>
      <label className='flex flex-col text-xs text-gray-600'>
        Region
        <select
          value={filters.region}
          onChange={(event) => onChange({ region: event.target.value, storeId: '' })}
          className={FIELD}
        >
          <option value=''>All regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>
      <label className='flex flex-col text-xs text-gray-600'>
        Store
        <select
          value={filters.storeId}
          onChange={(event) => onChange({ storeId: event.target.value })}
          className={FIELD}
        >
          <option value=''>All stores</option>
          {storeOptions.map((store) => (
            <option key={store._id} value={store._id}>
              {store.storeName}
            </option>
          ))}
        </select>
      </label>
      <label className='flex flex-col text-xs text-gray-600'>
        Status
        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className={FIELD}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className='flex flex-col text-xs text-gray-600'>
        From
        <input
          type='date'
          value={filters.fromDate}
          max={filters.toDate || undefined}
          onChange={(event) => onChange({ fromDate: event.target.value })}
          className={FIELD}
        />
      </label>
      <label className='flex flex-col text-xs text-gray-600'>
        To
        <input
          type='date'
          value={filters.toDate}
          min={filters.fromDate || undefined}
          onChange={(event) => onChange({ toDate: event.target.value })}
          className={FIELD}
        />
      </label>
      <button
        type='button'
        onClick={onClear}
        disabled={!hasFilters}
        className='h-10 rounded-md border border-primary px-4 text-sm text-primary disabled:border-gray-300 disabled:text-gray-400'
      >
        Clear
      </button>
      <button
        type='button'
        onClick={onRefresh}
        title='Refresh'
        className='grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white'
      >
        <IoRefresh size={20} />
      </button>
    </form>
  )
}

Filters.propTypes = {
  filters: PropTypes.object.isRequired,
  stores: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
}

/* ----------------------------------- Rows ---------------------------------- */

const PaidCell = ({ item }) => {
  if (item.paymentStatus !== 'PAYMENT_DONE') {
    return '-'
  }
  return (
    <>
      <p>{formatDate(item.paidAt) || '-'}</p>
      {item.paidBy && <p className='text-xs text-gray-500'>by {userName(item.paidBy)}</p>}
      {item.paymentReference && (
        <p className='text-xs text-gray-500'>Ref: {item.paymentReference}</p>
      )}
      {isUrl(item.paymentReceipt) && (
        <a
          href={item.paymentReceipt}
          target='_blank'
          rel='noreferrer'
          className='text-xs text-primary underline'
        >
          View receipt
        </a>
      )}
    </>
  )
}

PaidCell.propTypes = {
  item: PropTypes.object.isRequired,
}

const RequestRow = ({ item, index, highlighted, role, busy, onViewDevices, onConfirm }) => {
  let rowBg = index % 2 === 0 ? 'bg-gray-200' : 'bg-white'
  if (highlighted) {
    rowBg = 'bg-green-100'
  }
  return (
    <tr className={rowBg}>
      <td className={`${TD} text-left`}>
        <p className='font-medium'>{item.uniqueCode}</p>
        <p className='text-xs text-gray-500'>{formatDate(item.requestedAt || item.createdAt)}</p>
        {highlighted && <p className='text-xs font-semibold text-green-700'>Just created</p>}
      </td>
      <td className={TD}>{item.storeId?.storeName || '-'}</td>
      <td className={TD}>{item.storeId?.region || '-'}</td>
      <td className={TD}>{item.totalDevice}</td>
      <td className={TD}>
        <span className='font-semibold'>{formatAmount(item.totalAmount)}</span>
      </td>
      <td className={TD}>{MODE_LABELS[item.paymentMode] || item.paymentMode || '-'}</td>
      <td className={TD}>
        <span className={`${BADGE} ${STATUS_BADGES[item.paymentStatus] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[item.paymentStatus] || item.paymentStatus || '-'}
        </span>
        {item.flag?.reason && item.paymentStatus === 'FLAGGED' && (
          <p className='mt-1 max-w-48 whitespace-normal text-xs text-red-700'>{item.flag.reason}</p>
        )}
        {item.paymentStatus === 'PAYMENT_DONE' && (
          <p className='mt-1 text-xs text-green-700'>Sent to Logistics</p>
        )}
      </td>
      <td className={TD}>{userName(item.userId) || '-'}</td>
      <td className={TD}>
        <PaidCell item={item} />
      </td>
      <td className={TD}>
        <div className='flex justify-center gap-1.5'>
          <button
            type='button'
            onClick={() => onViewDevices(item)}
            className='rounded-md border border-gray-500 px-2 py-1 text-sm font-medium text-gray-700'
          >
            View Devices
          </button>
          {item.paymentStatus === 'PAYMENT_REQUESTED' && canMarkPaid(role, item) && (
            <button
              type='button'
              disabled={busy}
              onClick={() => onConfirm(item)}
              className='rounded-md bg-green-700 px-2 py-1 text-sm font-medium text-white disabled:opacity-60'
            >
              Confirm Payment
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

RequestRow.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  highlighted: PropTypes.bool.isRequired,
  role: PropTypes.string,
  busy: PropTypes.bool.isRequired,
  onViewDevices: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

/* ------------------------------------ Tab ---------------------------------- */

const StoreRequestsTab = ({ highlightCode }) => {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [devicesFor, setDevicesFor] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy] = useState(false)
  const token = sessionStorage.getItem('authToken')
  const role = JSON.parse(sessionStorage.getItem('profile') || '{}').role

  const query = useMemo(() => effectiveQuery(filters, page), [filters, page])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(endpoint(), {
        headers: { Authorization: token },
        params: query,
      })
      const data = response.data?.data || {}
      setItems(data.items || [])
      setTotal(data.total || 0)
      if (data.stores) {
        setStores(data.stores)
      }
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load store requests')
    } finally {
      setLoading(false)
    }
  }, [query, token])

  useEffect(() => {
    load()
  }, [load])

  const changeFilters = (patch) => {
    setPage(0)
    setFilters((previous) => ({ ...previous, ...patch }))
  }

  const confirmPayment = async ({ file, reference, remarks }) => {
    setBusy(true)
    try {
      const form = new FormData()
      if (file) {
        form.append('paymentReceipt', file)
      }
      form.append('paymentReference', reference)
      form.append('remarks', remarks)
      const response = await axios.post(endpoint(`/${confirming._id}/mark-paid`), form, {
        headers: { Authorization: token },
      })
      toast.success(response.data?.message || 'Payment confirmed')
      setConfirming(null)
      await load()
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Unable to confirm payment')
    } finally {
      setBusy(false)
    }
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1)

  return (
    <div>
      <Filters
        filters={filters}
        stores={stores}
        onChange={changeFilters}
        onClear={() => changeFilters(EMPTY_FILTERS)}
        onRefresh={load}
      />

      {error && <p className='m-4 text-red-600'>{error}</p>}

      <div className='m-2 md:m-5'>
        <div className='overflow-x-auto rounded-md border border-gray-300'>
          <table className='w-full'>
            <thead className='bg-primary text-white'>
              <tr>
                {HEADERS.map((header) => (
                  <th key={header} className={TH}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <RequestRow
                  key={item._id}
                  item={item}
                  index={index}
                  highlighted={Boolean(highlightCode) && item.uniqueCode === highlightCode}
                  role={role}
                  busy={busy}
                  onViewDevices={setDevicesFor}
                  onConfirm={setConfirming}
                />
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={HEADERS.length} className='p-8 text-center text-gray-500'>
                    No store payment requests found.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={HEADERS.length} className='p-8 text-center text-gray-500'>
                    Loading…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className='mt-3 flex items-center justify-center gap-3 text-sm'>
          <button
            type='button'
            disabled={page === 0 || loading}
            onClick={() => setPage((previous) => previous - 1)}
            className='rounded-md border px-3 py-1 disabled:opacity-50'
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages} · {total} request{total === 1 ? '' : 's'}
          </span>
          <button
            type='button'
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((previous) => previous + 1)}
            className='rounded-md border px-3 py-1 disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>

      {devicesFor && (
        <div className='fixed inset-0 z-[60] overflow-auto bg-white'>
          <p className='px-4 pt-4 text-lg font-semibold'>
            {devicesFor.uniqueCode} · {devicesFor.storeId?.storeName || ''}
          </p>
          <ViewPickupTable refNo={devicesFor._id} setShowView={() => setDevicesFor(null)} />
        </div>
      )}

      <ConfirmPaymentModal
        key={confirming?._id || 'none'}
        item={confirming}
        busy={busy}
        onClose={() => !busy && setConfirming(null)}
        onSubmit={confirmPayment}
      />
    </div>
  )
}

StoreRequestsTab.propTypes = {
  highlightCode: PropTypes.string,
}

export default StoreRequestsTab
