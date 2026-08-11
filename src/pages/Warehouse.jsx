import { Fragment, useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
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

const WarehouseToolbar = ({
  isWarehouse,
  courier,
  busy,
  onPushToLogistics,
  onRefreshTracking,
}) => {
  if (!isWarehouse) {
    return null
  }
  return (
    <div className='flex flex-wrap gap-2'>
      <button
        onClick={onPushToLogistics}
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
      <button
        onClick={onRefreshTracking}
        disabled={busy === 'track' || !courier.trackingConfigured}
        title={
          courier.trackingConfigured
            ? ''
            : 'Configure the courier tracking credentials first'
        }
        className='border border-primary text-primary rounded-lg px-4 py-2 disabled:opacity-50'
      >
        {busy === 'track' ? 'Refreshing…' : 'Refresh Tracking'}
      </button>
    </div>
  )
}

WarehouseToolbar.propTypes = {
  isWarehouse: PropTypes.bool.isRequired,
  courier: PropTypes.shape({
    configured: PropTypes.bool,
    trackingConfigured: PropTypes.bool,
  }).isRequired,
  busy: PropTypes.string.isRequired,
  onPushToLogistics: PropTypes.func.isRequired,
  onRefreshTracking: PropTypes.func.isRequired,
}

const TabBar = ({ tab, onSelectTab }) => (
  <div className='flex flex-wrap gap-2 mb-5'>
    {TABS.map(([value, label]) => (
      <button
        key={value}
        onClick={() => onSelectTab(value)}
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
)

TabBar.propTypes = {
  tab: PropTypes.string.isRequired,
  onSelectTab: PropTypes.func.isRequired,
}

const TableHeader = ({ isLogistic }) => (
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
)

TableHeader.propTypes = {
  isLogistic: PropTypes.bool.isRequired,
}

const CourierCell = ({ courier }) => (
  <td className='p-3'>
    <p>{courier?.provider || '-'}</p>
    {courier?.orderId && (
      <p className='text-xs text-gray-500'>AWB {courier.orderId}</p>
    )}
    {courier?.trackingStatus && (
      <p className='text-xs text-gray-700'>{courier.trackingStatus}</p>
    )}
    {courier?.labelUrl && (
      <a
        href={courier.labelUrl}
        target='_blank'
        rel='noreferrer'
        className='text-xs text-primary underline'
      >
        Download label
      </a>
    )}
    {courier?.lastError && (
      <p className='text-xs text-red-600'>{courier.lastError}</p>
    )}
  </td>
)

CourierCell.propTypes = {
  courier: PropTypes.shape({
    provider: PropTypes.string,
    orderId: PropTypes.string,
    trackingStatus: PropTypes.string,
    labelUrl: PropTypes.string,
    lastError: PropTypes.string,
  }),
}

const ActionsCell = ({
  lead,
  isWarehouse,
  canCancel,
  canRestore,
  agents,
  selection,
  busy,
  setSelection,
  assign,
  action,
  cancel,
}) => {
  const buttons = []

  if (isWarehouse && lead.deliveryStatus === 'UNASSIGNED') {
    buttons.push(
      <Fragment key='assign'>
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
      </Fragment>
    )
  }

  if (isWarehouse && lead.deliveryStatus === 'OUT_FOR_PICKUP') {
    buttons.push(
      <button
        key='pickup'
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
    )
  }

  if (
    isWarehouse &&
    ['PICKUP_COMPLETE', 'PUSHED_TO_LOGISTICS'].includes(lead.deliveryStatus)
  ) {
    buttons.push(
      <button
        key='delivered'
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
    )
  }

  if (canCancel && !['CANCELLED', 'DELIVERED'].includes(lead.deliveryStatus)) {
    buttons.push(
      <button
        key='cancel'
        disabled={busy === lead._id}
        onClick={() => cancel(lead)}
        className='border border-red-600 text-red-600 rounded px-3 py-1'
      >
        Cancel
      </button>
    )
  }

  if (canRestore && lead.deliveryStatus === 'CANCELLED') {
    buttons.push(
      <button
        key='restore'
        disabled={busy === lead._id}
        onClick={() => action(lead, 'restore')}
        className='border border-primary text-primary rounded px-3 py-1'
      >
        Restore
      </button>
    )
  }

  return (
    <td className='p-3'>
      <div className='flex flex-wrap gap-2'>{buttons}</div>
    </td>
  )
}

ActionsCell.propTypes = {
  lead: PropTypes.object.isRequired,
  isWarehouse: PropTypes.bool.isRequired,
  canCancel: PropTypes.bool.isRequired,
  canRestore: PropTypes.bool.isRequired,
  agents: PropTypes.array.isRequired,
  selection: PropTypes.object.isRequired,
  busy: PropTypes.string.isRequired,
  setSelection: PropTypes.func.isRequired,
  assign: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
}

const LeadRow = ({
  lead,
  isLogistic,
  isWarehouse,
  canCancel,
  canRestore,
  agents,
  selection,
  busy,
  setSelection,
  assign,
  action,
  cancel,
}) => (
  <tr className='border-t align-top'>
    <td className='p-3'>
      <p className='font-medium'>{lead.uniqueCode || lead._id}</p>
      <p className='text-xs text-gray-500'>{lead.name || '-'}</p>
    </td>
    <td className='p-3'>{lead.storeId?.storeName || '-'}</td>
    <td className='p-3'>{lead.modelId?.name || '-'}</td>
    <td className='p-3'>
      {STATUS_LABELS[lead.deliveryStatus] || lead.deliveryStatus}
      {lead.cancellation?.reason && (
        <p className='text-xs text-red-600'>{lead.cancellation.reason}</p>
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
    <CourierCell courier={lead.courier} />
    {!isLogistic && (
      <ActionsCell
        lead={lead}
        isWarehouse={isWarehouse}
        canCancel={canCancel}
        canRestore={canRestore}
        agents={agents}
        selection={selection}
        busy={busy}
        setSelection={setSelection}
        assign={assign}
        action={action}
        cancel={cancel}
      />
    )}
  </tr>
)

LeadRow.propTypes = {
  lead: PropTypes.object.isRequired,
  isLogistic: PropTypes.bool.isRequired,
  isWarehouse: PropTypes.bool.isRequired,
  canCancel: PropTypes.bool.isRequired,
  canRestore: PropTypes.bool.isRequired,
  agents: PropTypes.array.isRequired,
  selection: PropTypes.object.isRequired,
  busy: PropTypes.string.isRequired,
  setSelection: PropTypes.func.isRequired,
  assign: PropTypes.func.isRequired,
  action: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
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
    if (isLogistic) {
      return
    }
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/warehouse/logistic-agents`,
        { headers: { Authorization: token } }
      )
      .then((response) => setAgents(response.data.data || []))
      .catch(() => setAgents([]))
  }, [isLogistic, token])

  const action = async (lead, path, body = {}) => {
    if (busy) {
      return
    }
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
    if (reason?.trim()) {
      action(lead, 'cancel', { reason: reason.trim() })
    }
  }

  const pushToLogistics = async () => {
    if (busy) {
      return
    }
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

  const refreshTracking = async () => {
    if (busy) {
      return
    }
    setBusy('track')
    setError('')
    setMessage('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/warehouse/refresh-tracking`,
        {},
        { headers: { Authorization: token } }
      )
      setMessage(
        `${response.data.data.tracked} updated, ${response.data.data.failed} unavailable`
      )
      await load()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to refresh courier tracking'
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
          <WarehouseToolbar
            isWarehouse={isWarehouse}
            courier={courier}
            busy={busy}
            onPushToLogistics={pushToLogistics}
            onRefreshTracking={refreshTracking}
          />
        </div>

        {!isLogistic && <TabBar tab={tab} onSelectTab={setTab} />}

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
            <TableHeader isLogistic={isLogistic} />
            <tbody>
              {items.map((lead) => (
                <LeadRow
                  key={lead._id}
                  lead={lead}
                  isLogistic={isLogistic}
                  isWarehouse={isWarehouse}
                  canCancel={canCancel}
                  canRestore={canRestore}
                  agents={agents}
                  selection={selection}
                  busy={busy}
                  setSelection={setSelection}
                  assign={assign}
                  action={action}
                  cancel={cancel}
                />
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
