import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminNavbar from '../components/Admin_Navbar'
import SideMenu from '../components/SideMenu'
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTargetPath,
} from '../services/notificationService'

const PAGE_SIZE = 20

const formatWhen = (value) => {
  if (!value) {
    return ''
  }
  try {
    return new Date(value).toLocaleString()
  } catch {
    return ''
  }
}

const Notifications = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [items, setItems] = useState([])
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const loadPage = useCallback(async (nextPage) => {
    setLoading(true)
    try {
      const data = await fetchNotifications({ page: nextPage, limit: PAGE_SIZE })
      setItems((prev) =>
        nextPage === 0 ? data.items || [] : [...prev, ...(data.items || [])],
      )
      setTotal(data.total || 0)
      setUnreadCount(data.unreadCount || 0)
      setPage(nextPage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPage(0)
  }, [loadPage])

  const onRowClick = (item) => {
    if (!item.read) {
      setItems((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)),
      )
      setUnreadCount((count) => Math.max(0, count - 1))
      markNotificationRead(item._id).catch(() => {})
    }
    const target = notificationTargetPath(item)
    if (target) {
      navigate(target)
    }
  }

  const onMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await markAllNotificationsRead()
    } catch {
      loadPage(0)
    }
  }

  const hasMore = items.length < total

  return (
    <div className='min-h-screen bg-[#F5F4F9]'>
      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <main className='p-4 md:p-8'>
        <div className='flex flex-wrap justify-between items-end gap-4 mb-6'>
          <div>
            <h1 className='text-3xl font-semibold'>Notifications</h1>
            <p className='text-gray-600'>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You are all caught up.'}
            </p>
          </div>
          <div className='flex gap-3'>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAll}
                className='border border-primary text-primary px-4 py-2 rounded-lg'
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => loadPage(0)}
              className='border border-primary text-primary px-4 py-2 rounded-lg'
            >
              Refresh
            </button>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow divide-y'>
          {items.length === 0 && !loading ? (
            <div className='p-8 text-center text-gray-500'>
              No notifications yet.
            </div>
          ) : (
            items.map((item) => (
              <button
                type='button'
                key={item._id}
                onClick={() => onRowClick(item)}
                className={
                  'w-full text-left p-4 hover:bg-gray-50 ' +
                  (item.read ? 'bg-white' : 'bg-blue-50')
                }
              >
                <div className='flex items-start justify-between gap-3'>
                  <span className='font-medium text-gray-900'>
                    {item.title}
                  </span>
                  <span className='text-xs text-gray-400 whitespace-nowrap'>
                    {formatWhen(item.createdAt)}
                  </span>
                </div>
                {item.body && (
                  <p className='mt-1 text-sm text-gray-600'>{item.body}</p>
                )}
              </button>
            ))
          )}
        </div>

        {hasMore && (
          <div className='mt-4 text-center'>
            <button
              onClick={() => loadPage(page + 1)}
              disabled={loading}
              className='border border-primary text-primary px-6 py-2 rounded-lg disabled:opacity-50'
            >
              {loading ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Notifications
