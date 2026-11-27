import { useCallback, useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { BeatLoader } from 'react-spinners'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import { USER_ROLES } from '../constants/roleConstants'
import { FaAngleDown } from 'react-icons/fa'
import { IoMdSearch } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'
import styles from './CompanyListingDetails/CompanyListingDetails.module.css'
import styless from './QuotesCreatedAdmin/QuotesCreatedAdmin.module.css'
import ConfirmPaymentModal from './StoreRequests/ConfirmPaymentModal'
import ListPagination from '../components/ListPagination/ListPagination'
import {
  PAGE_SIZE,
  useDebouncedValue,
} from '../components/ListPagination/listPaging'

const STATUS_LABELS = {
  PAYMENT_REQUESTED: 'Payment Requested',
  FLAGGED: 'Flagged',
  PAYMENT_DONE: 'Payment Done',
}

const MODE_LABELS = {
  COMPANY_ACCOUNTS: 'Company Accounts',
  MANAGER_FUNDS: 'Manager Funds',
  PREPAID_DEFERRED: 'Pre-paid / Deferred',
}

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'PAYMENT_REQUESTED', label: 'Payment Requested' },
  { value: 'FLAGGED', label: 'Flagged' },
  { value: 'PAYMENT_DONE', label: 'Payment Done' },
]

const BADGE = 'inline-block px-2 py-0.5 rounded-md text-xs font-medium'
const BADGE_GREEN = 'bg-green-100 text-green-700 border border-green-300'
const BADGE_AMBER = 'bg-amber-100 text-amber-700 border border-amber-300'
const BADGE_RED = 'bg-red-100 text-red-700 border border-red-300'
const BADGE_GRAY = 'bg-gray-100 text-gray-700 border border-gray-300'

const PAYMENT_STATUS_BADGES = {
  PAYMENT_REQUESTED: BADGE_AMBER,
  FLAGGED: BADGE_RED,
  PAYMENT_DONE: BADGE_GREEN,
}

const EMAIL_BADGES = {
  DELIVERED: BADGE_GREEN,
  FAILED: BADGE_RED,
}

const LoadingOverlay = ({ loading }) => {
  if (!loading) {
    return null
  }
  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50'>
      <BeatLoader color='var(--primary-color)' size={15} />
    </div>
  )
}

LoadingOverlay.propTypes = {
  loading: PropTypes.bool.isRequired,
}

const FilterBar = ({
  search,
  onSearchChange,
  status,
  onSelectStatus,
  statusDrop,
  onToggleStatusDrop,
  onRefresh,
}) => (
  <div className='flex flex-wrap gap-2 items-center justify-center mt-5'>
    <div className={styles.search_bar_wrap}>
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className='text-sm'
        placeholder='Search lot code, store or amount...'
      />
      <IoMdSearch size={25} />
    </div>
    <div className='relative w-[250px]'>
      <div className={styless.filter_button} onClick={onToggleStatusDrop}>
        <p className='truncate'>
          {STATUS_FILTERS.find((s) => s.value === status)?.label ||
            'All statuses'}
        </p>
        <FaAngleDown size={17} className={statusDrop ? 'rotate-180' : ''} />
      </div>
      {statusDrop && (
        <div className='absolute w-full bg-white shadow-md'>
          <div className={`${styless.filter_drop} max-h-[200px] overflow-y-scroll`}>
            {STATUS_FILTERS.map((s) => (
              <div
                key={s.value}
                className={styless.filter_option}
                onClick={() => onSelectStatus(s.value)}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    <div className={styles.icons_box}>
      <IoRefresh size={25} onClick={onRefresh} />
    </div>
  </div>
)

FilterBar.propTypes = {
  search: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  onSelectStatus: PropTypes.func.isRequired,
  statusDrop: PropTypes.bool.isRequired,
  onToggleStatusDrop: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
}

const PaymentsTableHeader = () => (
  <thead className='bg-primary text-white'>
    <tr className='align-top'>
      <th className='p-2 min-w-[160px] text-sm md:p-3 md:text-base text-left'>Request</th>
      <th className='p-2 min-w-[120px] text-sm md:p-3 md:text-base'>Store</th>
      <th className='p-2 min-w-[90px] text-sm md:p-3 md:text-base'>Devices</th>
      <th className='p-2 min-w-[110px] text-sm md:p-3 md:text-base'>Amount</th>
      <th className='p-2 min-w-[170px] text-sm md:p-3 md:text-base'>Mode</th>
      <th className='p-2 min-w-[160px] text-sm md:p-3 md:text-base'>Status</th>
      <th className='p-2 min-w-[140px] text-sm md:p-3 md:text-base'>Requested By</th>
      <th className='p-2 min-w-[170px] text-sm md:p-3 md:text-base'>Paid</th>
      <th className='p-2 min-w-[110px] text-sm md:p-3 md:text-base'>Email</th>
      <th className='p-2 min-w-[300px] text-sm md:p-3 md:text-base'>Actions</th>
    </tr>
  </thead>
)

const PaymentStatusCell = ({ item }) => (
  <td className='p-2 text-sm text-center md:p-3 md:text-base'>
    <span
      className={`${BADGE} ${
        PAYMENT_STATUS_BADGES[item.paymentStatus] || BADGE_GRAY
      }`}
    >
      {STATUS_LABELS[item.paymentStatus] || item.paymentStatus}
    </span>
    {item.flag?.reason && (
      <p className='mt-1 text-xs text-red-600'>{item.flag.reason}</p>
    )}
  </td>
)

PaymentStatusCell.propTypes = {
  item: PropTypes.object.isRequired,
}

// Requester / payer name from the populated user (name, else first + last, else email).
const personName = (user) =>
  user?.name ||
  [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
  user?.email ||
  ''

const isUrl = (value) => /^https?:\/\//i.test(String(value || ''))

// When, by whom and with which reference / receipt the store was paid.
const PaidCell = ({ item }) => (
  <td className='p-2 text-sm text-center md:p-3 md:text-base'>
    {item.paymentStatus === 'PAYMENT_DONE' ? (
      <>
        <p className='whitespace-nowrap'>
          {item.paidAt ? new Date(item.paidAt).toLocaleString('en-IN') : '-'}
        </p>
        {item.paidBy && (
          <p className='text-xs text-gray-500'>by {personName(item.paidBy)}</p>
        )}
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
    ) : (
      '-'
    )}
  </td>
)

PaidCell.propTypes = {
  item: PropTypes.object.isRequired,
}

const EmailCell = ({ item }) => (
  <td className='p-2 text-sm text-center md:p-3 md:text-base'>
    <span
      className={`${BADGE} ${
        EMAIL_BADGES[item.notification?.state] || BADGE_GRAY
      }`}
    >
      {item.notification?.state || 'NOT SENT'}
    </span>
  </td>
)

EmailCell.propTypes = {
  item: PropTypes.object.isRequired,
}

const ActionsCell = ({
  item,
  busyId,
  canAccountAction,
  canMarkPaid,
  onView,
  onFlag,
  onUnflag,
  onMarkPaid,
}) => {
  const buttons = [
    <button
      key='view'
      onClick={() => onView(item)}
      className='border border-primary text-primary px-2 py-1 text-xs font-medium rounded-md'
    >
      View
    </button>,
  ]

  if (canAccountAction && item.paymentStatus === 'PAYMENT_REQUESTED') {
    buttons.push(
      <button
        key='flag'
        disabled={busyId === item._id}
        onClick={() => onFlag(item)}
        className='border border-amber-600 text-amber-700 px-2 py-1 text-xs font-medium rounded-md disabled:opacity-50'
      >
        Flag
      </button>
    )
  }

  if (canAccountAction && item.paymentStatus === 'FLAGGED') {
    buttons.push(
      <button
        key='unflag'
        disabled={busyId === item._id}
        onClick={() => onUnflag(item)}
        className='border border-primary text-primary px-2 py-1 text-xs font-medium rounded-md disabled:opacity-50'
      >
        Unflag
      </button>
    )
  }

  if (canMarkPaid(item) && item.paymentStatus === 'PAYMENT_REQUESTED') {
    buttons.push(
      <button
        key='markPaid'
        disabled={busyId === item._id}
        onClick={() => onMarkPaid(item)}
        className='bg-green-700 text-white px-2 py-1 text-xs font-medium rounded-md disabled:opacity-50'
      >
        Mark Paid
      </button>
    )
  }

  return (
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      <div className='flex justify-center gap-1.5 whitespace-nowrap'>
        {buttons}
      </div>
    </td>
  )
}

ActionsCell.propTypes = {
  item: PropTypes.object.isRequired,
  busyId: PropTypes.string.isRequired,
  canAccountAction: PropTypes.bool.isRequired,
  canMarkPaid: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired,
  onMarkPaid: PropTypes.func.isRequired,
}

const PaymentsRow = ({
  item,
  index,
  busyId,
  canAccountAction,
  canMarkPaid,
  onView,
  onFlag,
  onUnflag,
  onMarkPaid,
}) => (
  <tr className={index % 2 === 0 ? 'bg-gray-200' : ''}>
    <td className='p-2 text-sm text-left md:p-3 md:text-base'>
      <p className='font-medium whitespace-nowrap'>{item.uniqueCode}</p>
      {item.requestedAt && (
        <p className='text-xs text-gray-500 whitespace-nowrap'>
          {new Date(item.requestedAt).toLocaleString('en-IN')}
        </p>
      )}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {item.storeId?.storeName || '-'}
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      <span className='font-medium'>{item.totalDevice}</span>
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      <span className='font-semibold whitespace-nowrap'>
        ₹{Number(item.totalAmount || 0).toFixed(2)}
      </span>
    </td>
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {MODE_LABELS[item.paymentMode] || item.paymentMode}
    </td>
    <PaymentStatusCell item={item} />
    <td className='p-2 text-sm text-center md:p-3 md:text-base'>
      {personName(item.userId) || '-'}
    </td>
    <PaidCell item={item} />
    <EmailCell item={item} />
    <ActionsCell
      item={item}
      busyId={busyId}
      canAccountAction={canAccountAction}
      canMarkPaid={canMarkPaid}
      onView={onView}
      onFlag={onFlag}
      onUnflag={onUnflag}
      onMarkPaid={onMarkPaid}
    />
  </tr>
)

PaymentsRow.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  busyId: PropTypes.string.isRequired,
  canAccountAction: PropTypes.bool.isRequired,
  canMarkPaid: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onFlag: PropTypes.func.isRequired,
  onUnflag: PropTypes.func.isRequired,
  onMarkPaid: PropTypes.func.isRequired,
}

const PaymentDetailModal = ({ selected, onClose }) => {
  if (!selected) {
    return null
  }
  return (
    <div className='fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6'>
        <div className='flex justify-between mb-4'>
          <div>
            <h2 className='text-xl font-semibold'>{selected.uniqueCode}</h2>
            <p className='text-sm text-gray-500'>
              Read-only request and audit detail
            </p>
          </div>
          <button onClick={onClose}>Close</button>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-5'>
          <p>Store: {selected.storeId?.storeName || '-'}</p>
          <p>Devices: {selected.totalDevice}</p>
          <p>Amount: ₹{Number(selected.totalAmount).toFixed(2)}</p>
          <p>Status: {STATUS_LABELS[selected.paymentStatus]}</p>
        </div>
        <h3 className='font-semibold mb-2'>Audit trail</h3>
        <div className='space-y-2'>
          {[...(selected.history || [])].reverse().map((entry, index) => (
            <div
              key={`${entry.timestamp}-${index}`}
              className='border rounded-lg p-3 text-sm'
            >
              <p className='font-medium'>{entry.action}</p>
              <p className='text-gray-500'>
                {entry.timestamp
                  ? new Date(entry.timestamp).toLocaleString('en-IN')
                  : '-'}
                {entry.remarks ? ` — ${entry.remarks}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

PaymentDetailModal.propTypes = {
  selected: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}

const StorePayments = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [statusDrop, setStatusDrop] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [confirmError, setConfirmError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = PAGE_SIZE
  const [total, setTotal] = useState(0)
  const debouncedSearch = useDebouncedValue(search.trim())
  // Only the newest list request may update the table.
  const latestRequest = useRef(0)
  const token = sessionStorage.getItem('authToken')
  const profile = JSON.parse(sessionStorage.getItem('profile') || '{}')

  // Search and paging run on the server, over every request the user may see.
  // The API counts pages from 0; the pager shows them from 1.
  const load = useCallback(async () => {
    const requestId = latestRequest.current + 1
    latestRequest.current = requestId
    const isStale = () => requestId !== latestRequest.current
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store-payments`,
        {
          headers: { Authorization: token },
          params: {
            page: page - 1,
            limit,
            ...(status ? { status } : {}),
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
          },
        }
      )
      if (isStale()) {
        return
      }
      const data = response.data.data
      const count = data.total || 0
      const lastPage = Math.max(Math.ceil(count / limit), 1)
      // The last row of the last page left the list (e.g. after Mark Paid).
      if (page > lastPage) {
        setPage(lastPage)
        return
      }
      setItems(data.items || [])
      setTotal(count)
      setError('')
    } catch (requestError) {
      if (!isStale()) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load store payment requests'
        )
      }
    } finally {
      if (!isStale()) {
        setLoading(false)
      }
    }
  }, [status, token, page, limit, debouncedSearch])

  // A new search starts again from the first page.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const perform = async (item, action, body = {}) => {
    if (busyId) {
      return
    }
    setBusyId(item._id)
    setError('')
    setMessage('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store-payments/${item._id}/${action}`,
        body,
        { headers: { Authorization: token } }
      )
      setMessage(response.data.message)
      await load()
      return ''
    } catch (requestError) {
      const failure = requestError.response?.data?.message || 'Action failed'
      setError(failure)
      return failure
    } finally {
      setBusyId('')
    }
  }

  const flag = (item) => {
    const reason = window.prompt('Reason for flagging this payment request')
    if (reason?.trim()) {
      perform(item, 'flag', { reason: reason.trim() })
    }
  }

  const unflag = (item) => {
    const resolution =
      window.prompt('Resolution / clarification (optional)') || ''
    perform(item, 'unflag', { resolution })
  }

  // Mark Paid opens the Confirm Payment form (receipt file + reference +
  // remarks).
  const markPaid = (item) => {
    setConfirmError('')
    setConfirming(item)
  }

  const confirmPayment = async ({ file, reference, remarks }) => {
    const form = new FormData()
    if (file) {
      form.append('paymentReceipt', file)
    }
    form.append('paymentReference', reference)
    form.append('remarks', remarks)
    const failure = await perform(confirming, 'mark-paid', form)
    if (failure) {
      setConfirmError(failure)
      return
    }
    setConfirming(null)
  }

  const view = async (item) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store-payments/${item._id}`,
        { headers: { Authorization: token } }
      )
      setSelected(response.data.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to open request')
    }
  }

  const canMarkPaid = (item) =>
    profile.role === USER_ROLES.SUPER_ADMIN ||
    (profile.role === USER_ROLES.ACCOUNTS_USER &&
      item.paymentMode === 'COMPANY_ACCOUNTS') ||
    (profile.role === USER_ROLES.MANAGER &&
      item.paymentMode === 'MANAGER_FUNDS')

  const canAccountAction =
    profile.role === USER_ROLES.ACCOUNTS_USER ||
    profile.role === USER_ROLES.SUPER_ADMIN

  return (
    <div>
      <LoadingOverlay loading={loading} />

      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />

      <div className='pt-1 pb-2 px-4 md:pt-2 md:px-8'>
        <h1 className='text-3xl font-semibold'>Store Payments</h1>
        <p className='text-gray-600'>
          Accounts queue and payment confirmation.
        </p>
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onSelectStatus={(value) => {
          setStatus(value)
          setStatusDrop(false)
          setPage(1)
        }}
        statusDrop={statusDrop}
        onToggleStatusDrop={() => setStatusDrop((previous) => !previous)}
        onRefresh={load}
      />

      {error && <p className='m-4 text-red-600'>{error}</p>}
      {message && <p className='m-4 text-green-700'>{message}</p>}
      {items.some((item) => item.notification?.state === 'FAILED') && (
        <div className='m-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-800'>
          One or more completed payments have email delivery failures after
          the configured retries. Open the affected row for recipient and
          audit details.
        </div>
      )}

      <div className='m-2 overflow-x-auto md:m-5'>
        <table className='w-full border border-primary'>
          <PaymentsTableHeader />
          <tbody>
            {items.map((item, index) => (
              <PaymentsRow
                key={item._id}
                item={item}
                index={index}
                busyId={busyId}
                canAccountAction={canAccountAction}
                canMarkPaid={canMarkPaid}
                onView={view}
                onFlag={flag}
                onUnflag={unflag}
                onMarkPaid={markPaid}
              />
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan='10' className='p-8 text-center text-gray-500'>
                  No store payment requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ListPagination
        page={page}
        pageSize={limit}
        total={total}
        disabled={loading}
        onPageChange={setPage}
      />

      <PaymentDetailModal
        selected={selected}
        onClose={() => setSelected(null)}
      />
      <ConfirmPaymentModal
        key={confirming?._id || 'none'}
        item={confirming}
        busy={Boolean(busyId)}
        error={confirmError}
        onClose={() => !busyId && setConfirming(null)}
        onSubmit={confirmPayment}
      />
    </div>
  )
}

export default StorePayments
