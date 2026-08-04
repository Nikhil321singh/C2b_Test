import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import { generateExcelFile } from '../utils/excelHelper'

const PayoutManagement = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const token = sessionStorage.getItem('authToken')

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
    if (busyId) return
    setBusyId(id)
    setError('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts/${id}/${path}`,
        body,
        { headers: { Authorization: token } }
      )
      await load()
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
    const rows = items.map((item) => ({
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
      Created: item.createdAt
        ? new Date(item.createdAt).toLocaleString('en-IN')
        : '',
      Paid: item.paidAt
        ? new Date(item.paidAt).toLocaleString('en-IN')
        : '',
    }))
    generateExcelFile(rows, 'HSBC_Payouts_UAT')
  }

  return (
    <div className='min-h-screen bg-[#F5F4F9]'>
      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <main className='p-4 md:p-8'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-semibold'>Customer Payouts</h1>
            <p className='text-gray-600'>
              Approve, initiate and reconcile HSBC payouts (UPI, IMPS &amp;
              NEFT).
            </p>
          </div>
          <button
            onClick={load}
            className='border border-primary text-primary px-4 py-2 rounded-lg'
          >
            Refresh
          </button>
          <button
            onClick={exportPayouts}
            disabled={items.length === 0}
            className='border border-primary text-primary px-4 py-2 rounded-lg disabled:opacity-50'
          >
            Export
          </button>
        </div>
        {error && <p className='mb-4 text-red-600'>{error}</p>}
        <div className='overflow-x-auto bg-white rounded-xl shadow'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-100 text-left'>
              <tr>
                <th className='p-3'>Lead</th>
                <th className='p-3'>Store</th>
                <th className='p-3'>Amount</th>
                <th className='p-3'>Payout to</th>
                <th className='p-3'>Status</th>
                <th className='p-3'>Approval</th>
                <th className='p-3'>Order / RRN</th>
                <th className='p-3'>Receipt</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className='border-t'>
                  <td className='p-3'>{item.leadId?.uniqueCode || item.leadId?._id}</td>
                  <td className='p-3'>{item.storeId?.storeName || '-'}</td>
                  <td className='p-3'>₹{Number(item.amount).toFixed(2)}</td>
                  <td className='p-3'>
                    {['HSBC_IMPS', 'HSBC_NEFT'].includes(item.provider)
                      ? item.beneficiaryAccountMasked || '-'
                      : item.beneficiaryVpaMasked || '-'}
                  </td>
                  <td className='p-3'>{item.status.replaceAll('_', ' ')}</td>
                  <td className='p-3'>
                    {item.approval?.required
                      ? item.approval?.status || 'PENDING'
                      : 'Not required'}
                  </td>
                  <td className='p-3'>
                    <p>{item.merchantOrderNo || '-'}</p>
                    <p className='text-xs text-gray-500'>
                      RRN: {item.providerTransactionRrn || '-'}
                    </p>
                  </td>
                  <td className='p-3'>{item.receiptState || '-'}</td>
                  <td className='p-3 flex flex-wrap gap-2'>
                    {item.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          disabled={busyId === item._id}
                          onClick={() =>
                            action(item._id, 'approval', { approved: true })
                          }
                          className='bg-green-600 text-white px-3 py-1 rounded disabled:opacity-60'
                        >
                          Approve
                        </button>
                        <button
                          disabled={busyId === item._id}
                          onClick={() =>
                            action(item._id, 'approval', { approved: false })
                          }
                          className='bg-red-600 text-white px-3 py-1 rounded disabled:opacity-60'
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {item.status === 'READY_FOR_PAYMENT' && (
                      <button
                        disabled={busyId === item._id}
                        onClick={() => action(item._id, 'pay')}
                        className='bg-primary text-white px-3 py-1 rounded disabled:opacity-60'
                      >
                        Make Payment
                      </button>
                    )}
                    {['PROCESSING', 'STATUS_UNKNOWN'].includes(item.status) && (
                      <button
                        disabled={busyId === item._id}
                        onClick={() => action(item._id, 'status')}
                        className='border border-primary text-primary px-3 py-1 rounded disabled:opacity-60'
                      >
                        Check Status
                      </button>
                    )}
                    {(item.status === 'EXPIRED' ||
                      item.status === 'FAILED' ||
                      (item.status === 'AWAITING_VPA' &&
                        item.linkNotificationState !== 'DELIVERED')) && (
                      <button
                        disabled={busyId === item._id}
                        onClick={() => action(item._id, 'resend-link')}
                        className='border border-primary text-primary px-3 py-1 rounded disabled:opacity-60'
                      >
                        {item.status === 'FAILED'
                          ? ['HSBC_IMPS', 'HSBC_NEFT'].includes(item.provider)
                            ? 'Re-enter bank details'
                            : 'Re-enter UPI'
                          : item.linkNotificationState === 'FAILED'
                          ? 'Retry Link'
                          : 'Send Link'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan='10' className='p-8 text-center text-gray-500'>
                    No payouts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <p className='p-8 text-center'>Loading payouts…</p>}
        </div>
      </main>
    </div>
  )
}

export default PayoutManagement
