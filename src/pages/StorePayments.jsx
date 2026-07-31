import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import { USER_ROLES } from '../constants/roleConstants'

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

const StorePayments = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)
  const token = sessionStorage.getItem('authToken')
  const profile = JSON.parse(sessionStorage.getItem('profile') || '{}')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store-payments`,
        {
          headers: { Authorization: token },
          params: status ? { status } : {},
        }
      )
      setItems(response.data.data.items || [])
      setError('')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load store payment requests'
      )
    } finally {
      setLoading(false)
    }
  }, [status, token])

  useEffect(() => {
    load()
  }, [load])

  const perform = async (item, action, body = {}) => {
    if (busyId) return
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
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Action failed')
    } finally {
      setBusyId('')
    }
  }

  const flag = (item) => {
    const reason = window.prompt('Reason for flagging this payment request')
    if (reason?.trim()) perform(item, 'flag', { reason: reason.trim() })
  }

  const unflag = (item) => {
    const resolution =
      window.prompt('Resolution / clarification (optional)') || ''
    perform(item, 'unflag', { resolution })
  }

  const markPaid = (item) => {
    const paymentReference =
      window.prompt('Payment reference / transaction number (optional)') || ''
    const paymentReceipt =
      window.prompt(
        'Existing receipt URL (optional; leave blank to auto-generate a PDF)'
      ) || ''
    const confirmed = window.confirm(
      `Mark ${item.uniqueCode} as paid for ₹${Number(item.totalAmount).toFixed(2)}? This cannot be paid again.`
    )
    if (confirmed) {
      perform(item, 'mark-paid', { paymentReference, paymentReceipt })
    }
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
    <div className='min-h-screen bg-[#F5F4F9]'>
      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <main className='p-4 md:p-8'>
        <div className='flex flex-wrap justify-between items-end gap-4 mb-6'>
          <div>
            <h1 className='text-3xl font-semibold'>Store Payments</h1>
            <p className='text-gray-600'>
              Accounts queue, payment confirmation and Warehouse handoff.
            </p>
          </div>
          <div className='flex gap-3'>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className='border rounded-lg px-3 py-2 bg-white'
            >
              <option value=''>All statuses</option>
              <option value='PAYMENT_REQUESTED'>Payment Requested</option>
              <option value='FLAGGED'>Flagged</option>
              <option value='PAYMENT_DONE'>Payment Done</option>
            </select>
            <button
              onClick={load}
              className='border border-primary text-primary px-4 py-2 rounded-lg'
            >
              Refresh
            </button>
          </div>
        </div>

        {error && <p className='mb-4 text-red-600'>{error}</p>}
        {message && <p className='mb-4 text-green-700'>{message}</p>}
        {items.some((item) => item.notification?.state === 'FAILED') && (
          <div className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-800'>
            One or more completed payments have email delivery failures after
            the configured retries. Open the affected row for recipient and
            audit details.
          </div>
        )}

        <div className='overflow-x-auto bg-white rounded-xl shadow'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-100 text-left'>
              <tr>
                <th className='p-3'>Request</th>
                <th className='p-3'>Store</th>
                <th className='p-3'>Devices</th>
                <th className='p-3'>Amount</th>
                <th className='p-3'>Mode</th>
                <th className='p-3'>Status</th>
                <th className='p-3'>Warehouse</th>
                <th className='p-3'>Email</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className='border-t align-top'>
                  <td className='p-3'>
                    <p className='font-medium'>{item.uniqueCode}</p>
                    <p className='text-xs text-gray-500'>
                      {item.requestedAt
                        ? new Date(item.requestedAt).toLocaleString('en-IN')
                        : '-'}
                    </p>
                  </td>
                  <td className='p-3'>{item.storeId?.storeName || '-'}</td>
                  <td className='p-3'>{item.totalDevice}</td>
                  <td className='p-3'>
                    ₹{Number(item.totalAmount || 0).toFixed(2)}
                  </td>
                  <td className='p-3'>
                    {MODE_LABELS[item.paymentMode] || item.paymentMode}
                  </td>
                  <td className='p-3'>
                    {STATUS_LABELS[item.paymentStatus] || item.paymentStatus}
                    {item.flag?.reason && (
                      <p className='text-xs text-red-600'>
                        {item.flag.reason}
                      </p>
                    )}
                  </td>
                  <td className='p-3'>
                    {item.warehouseStatus === 'IN_WAREHOUSE'
                      ? 'In Warehouse'
                      : 'Not ready'}
                  </td>
                  <td className='p-3'>
                    <span
                      className={
                        item.notification?.state === 'FAILED'
                          ? 'text-red-600'
                          : ''
                      }
                    >
                      {item.notification?.state || 'NOT SENT'}
                    </span>
                  </td>
                  <td className='p-3'>
                    <div className='flex flex-wrap gap-2'>
                      <button
                        onClick={() => view(item)}
                        className='border border-gray-400 px-3 py-1 rounded'
                      >
                        View
                      </button>
                      {canAccountAction &&
                        item.paymentStatus === 'PAYMENT_REQUESTED' && (
                          <button
                            disabled={busyId === item._id}
                            onClick={() => flag(item)}
                            className='border border-amber-600 text-amber-700 px-3 py-1 rounded disabled:opacity-50'
                          >
                            Flag
                          </button>
                        )}
                      {canAccountAction &&
                        item.paymentStatus === 'FLAGGED' && (
                          <button
                            disabled={busyId === item._id}
                            onClick={() => unflag(item)}
                            className='border border-primary text-primary px-3 py-1 rounded disabled:opacity-50'
                          >
                            Unflag
                          </button>
                        )}
                      {canMarkPaid(item) &&
                        item.paymentStatus === 'PAYMENT_REQUESTED' && (
                          <button
                            disabled={busyId === item._id}
                            onClick={() => markPaid(item)}
                            className='bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50'
                          >
                            Mark Paid
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan='9' className='p-8 text-center text-gray-500'>
                    No store payment requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <p className='p-8 text-center'>Loading payments…</p>}
        </div>
      </main>

      {selected && (
        <div className='fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6'>
            <div className='flex justify-between mb-4'>
              <div>
                <h2 className='text-xl font-semibold'>{selected.uniqueCode}</h2>
                <p className='text-sm text-gray-500'>
                  Read-only request and audit detail
                </p>
              </div>
              <button onClick={() => setSelected(null)}>Close</button>
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
      )}
    </div>
  )
}

export default StorePayments
