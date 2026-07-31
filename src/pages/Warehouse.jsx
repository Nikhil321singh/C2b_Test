import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import { USER_ROLES } from '../constants/roleConstants'

const TABS = [
  ['', 'All Leads'],
  ['unassigned', 'Unassigned'],
  ['assigned', 'Assigned'],
  ['picked-up', 'Picked Up'],
  ['cancelled', 'Cancelled'],
]

const STATUS_LABELS = {
  UNASSIGNED: 'Unassigned',
  OUT_FOR_PICKUP: 'Out For Pickup',
  PICKUP_COMPLETE: 'Pickup Complete',
  CANCELLED: 'Cancelled',
  PUSHED_TO_LOGISTICS: 'Pushed to Logistics',
  DELIVERED: 'Delivered',
}

const Warehouse = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [tab, setTab] = useState('')
  const [items, setItems] = useState([])
  const [agents, setAgents] = useState([])
  const [selection, setSelection] = useState({})
  const [courier, setCourier] = useState({ configured: false })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const token = sessionStorage.getItem('authToken')
  const profile = JSON.parse(sessionStorage.getItem('profile') || '{}')
  const isWarehouse =
    profile.role === USER_ROLES.WAREHOUSE_USER ||
    profile.role === USER_ROLES.SUPER_ADMIN
  const canRestore =
    profile.role === USER_ROLES.COMPANY_ADMIN ||
    profile.role === USER_ROLES.SUPER_ADMIN
  const canCancel = isWarehouse || canRestore
  const isLogistic = profile.role === USER_ROLES.LOGISTIC_USER

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/warehouse/leads`,
        {
          headers: { Authorization: token },
          params: tab ? { tab } : {},
        }
      )
      setItems(response.data.data.items || [])
      setCourier(response.data.data.courier || { configured: false })
      setError('')
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load Warehouse leads'
      )
    } finally {
      setLoading(false)
    }
  }, [tab, token])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (isLogistic) return
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/warehouse/logistic-agents`,
        { headers: { Authorization: token } }
      )
      .then((response) => setAgents(response.data.data || []))
      .catch(() => setAgents([]))
  }, [isLogistic, token])

  const action = async (lead, path, body = {}) => {
    if (busy) return
    setBusy(lead._id)
    setError('')
    setMessage('')
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/warehouse/leads/${lead._id}/${path}`,
        body,
        { headers: { Authorization: token } }
      )
      setMessage('Warehouse lead updated successfully')
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Warehouse action failed')
    } finally {
      setBusy('')
    }
  }

  const assign = (lead) => {
    const logisticAgentId = selection[lead._id]
    if (!logisticAgentId) {
      setError('Select an active Logistic agent first')
      return
    }
    action(lead, 'assign', { logisticAgentId })
  }

  const cancel = (lead) => {
    const reason = window.prompt('Cancellation reason')
    if (reason?.trim()) action(lead, 'cancel', { reason: reason.trim() })
  }

  const pushToLogistics = async () => {
    if (busy) return
    setBusy('push')
    setError('')
    setMessage('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/warehouse/push-to-logistics`,
        {},
        { headers: { Authorization: token } }
      )
      setMessage(
        `${response.data.data.pushed} pushed, ${response.data.data.failed} failed`
      )
      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to push leads to Logistics'
      )
    } finally {
      setBusy('')
    }
  }

  return (
    <div className='min-h-screen bg-[#F5F4F9]'>
      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <main className='p-4 md:p-8'>
        <div className='flex flex-wrap justify-between items-end gap-4 mb-5'>
          <div>
            <h1 className='text-3xl font-semibold'>Warehouse</h1>
            <p className='text-gray-600'>
              Logistic assignment, delivery tracking and courier handoff.
            </p>
          </div>
          {isWarehouse && (
            <button
              onClick={pushToLogistics}
              disabled={busy === 'push' || !courier.configured}
              title={
                courier.configured
                  ? ''
                  : 'Configure the courier server credentials and endpoint first'
              }
              className='bg-primary text-white rounded-lg px-4 py-2 disabled:opacity-50'
            >
              {busy === 'push' ? 'Pushing…' : 'Push to Logistics'}
            </button>
          )}
        </div>

        {!isLogistic && (
          <div className='flex flex-wrap gap-2 mb-5'>
            {TABS.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`rounded-lg px-4 py-2 ${
                  tab === value
                    ? 'bg-primary text-white'
                    : 'bg-white border text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {isWarehouse && !courier.configured && (
          <p className='mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-800'>
            Courier push is disabled until the server-side courier endpoint and
            credentials are configured. Assignment and delivery tracking are
            available.
          </p>
        )}
        {error && <p className='mb-4 text-red-600'>{error}</p>}
        {message && <p className='mb-4 text-green-700'>{message}</p>}

        <div className='overflow-x-auto rounded-xl bg-white shadow'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-100 text-left'>
              <tr>
                <th className='p-3'>Lead</th>
                <th className='p-3'>Store</th>
                <th className='p-3'>Device</th>
                <th className='p-3'>Status</th>
                <th className='p-3'>Logistic Agent</th>
                <th className='p-3'>Courier</th>
                {!isLogistic && <th className='p-3'>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => (
                <tr key={lead._id} className='border-t align-top'>
                  <td className='p-3'>
                    <p className='font-medium'>
                      {lead.uniqueCode || lead._id}
                    </p>
                    <p className='text-xs text-gray-500'>{lead.name || '-'}</p>
                  </td>
                  <td className='p-3'>{lead.storeId?.storeName || '-'}</td>
                  <td className='p-3'>{lead.modelId?.name || '-'}</td>
                  <td className='p-3'>
                    {STATUS_LABELS[lead.deliveryStatus] || lead.deliveryStatus}
                    {lead.cancellation?.reason && (
                      <p className='text-xs text-red-600'>
                        {lead.cancellation.reason}
                      </p>
                    )}
                  </td>
                  <td className='p-3'>
                    {lead.logisticAgentId?.name ||
                      [
                        lead.logisticAgentId?.firstName,
                        lead.logisticAgentId?.lastName,
                      ]
                        .filter(Boolean)
                        .join(' ') ||
                      '-'}
                  </td>
                  <td className='p-3'>
                    <p>{lead.courier?.provider || '-'}</p>
                    <p className='text-xs text-gray-500'>
                      {lead.courier?.orderId || lead.courier?.lastError || ''}
                    </p>
                  </td>
                  {!isLogistic && (
                    <td className='p-3'>
                      <div className='flex flex-wrap gap-2'>
                        {isWarehouse &&
                          lead.deliveryStatus === 'UNASSIGNED' && (
                            <>
                              <select
                                value={selection[lead._id] || ''}
                                onChange={(event) =>
                                  setSelection((previous) => ({
                                    ...previous,
                                    [lead._id]: event.target.value,
                                  }))
                                }
                                className='border rounded px-2 py-1'
                              >
                                <option value=''>Select agent</option>
                                {agents.map((agent) => (
                                  <option key={agent._id} value={agent._id}>
                                    {agent.name ||
                                      `${agent.firstName || ''} ${agent.lastName || ''}`}
                                  </option>
                                ))}
                              </select>
                              <button
                                disabled={busy === lead._id}
                                onClick={() => assign(lead)}
                                className='bg-primary text-white rounded px-3 py-1 disabled:opacity-50'
                              >
                                Assign
                              </button>
                            </>
                          )}
                        {isWarehouse &&
                          lead.deliveryStatus === 'OUT_FOR_PICKUP' && (
                            <button
                              disabled={busy === lead._id}
                              onClick={() =>
                                action(lead, 'status', {
                                  deliveryStatus: 'PICKUP_COMPLETE',
                                })
                              }
                              className='border border-green-700 text-green-700 rounded px-3 py-1'
                            >
                              Pickup Complete
                            </button>
                          )}
                        {isWarehouse &&
                          ['PICKUP_COMPLETE', 'PUSHED_TO_LOGISTICS'].includes(
                            lead.deliveryStatus
                          ) && (
                            <button
                              disabled={busy === lead._id}
                              onClick={() =>
                                action(lead, 'status', {
                                  deliveryStatus: 'DELIVERED',
                                })
                              }
                              className='border border-green-700 text-green-700 rounded px-3 py-1'
                            >
                              Delivered
                            </button>
                          )}
                        {canCancel &&
                          !['CANCELLED', 'DELIVERED'].includes(
                            lead.deliveryStatus
                          ) && (
                            <button
                              disabled={busy === lead._id}
                              onClick={() => cancel(lead)}
                              className='border border-red-600 text-red-600 rounded px-3 py-1'
                            >
                              Cancel
                            </button>
                          )}
                        {canRestore &&
                          lead.deliveryStatus === 'CANCELLED' && (
                            <button
                              disabled={busy === lead._id}
                              onClick={() => action(lead, 'restore')}
                              className='border border-primary text-primary rounded px-3 py-1'
                            >
                              Restore
                            </button>
                          )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td
                    colSpan={isLogistic ? 6 : 7}
                    className='p-8 text-center text-gray-500'
                  >
                    No Warehouse leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <p className='p-8 text-center'>Loading Warehouse…</p>}
        </div>
      </main>
    </div>
  )
}

export default Warehouse

