import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoMdNotificationsOutline } from 'react-icons/io'
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationTargetPath,
} from '../../services/notificationService'

const POLL_INTERVAL_MS = 30000

// Compact relative time, e.g. "just now", "5m", "3h", "2d".
const timeAgo = (value) => {
  if (!value) {
    return ''
  }
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) {
    return 'just now'
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h`
  }
  return `${Math.floor(hours / 24)}d`
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  const hasToken = Boolean(sessionStorage.getItem('authToken'))

  const refreshUnread = useCallback(async () => {
    if (!hasToken) {
      return
    }
    try {
      setUnreadCount(await fetchUnreadCount())
    } catch {
      // Bell failures are non-critical; the interceptor already surfaces auth errors.
    }
  }, [hasToken])

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchNotifications({ limit: 20 })
      setItems(data.items || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll the unread count while mounted.
  useEffect(() => {
    if (!hasToken) {
      return undefined
    }
    refreshUnread()
    const timer = setInterval(refreshUnread, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [hasToken, refreshUnread])

  // Close on outside click.
  useEffect(() => {
    const onClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      loadList()
    }
  }

  const onItemClick = (item) => {
    if (!item.read) {
      setItems((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, read: true } : n)),
      )
      setUnreadCount((count) => Math.max(0, count - 1))
      markNotificationRead(item._id).catch(refreshUnread)
    }
    setOpen(false)
    const target = notificationTargetPath(item)
    if (target) {
      navigate(target)
    }
  }

  const viewAll = () => {
    setOpen(false)
    navigate('/notifications')
  }

  const onMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    try {
      await markAllNotificationsRead()
    } catch {
      refreshUnread()
    }
  }

  if (!hasToken) {
    return null
  }

  return (
    <div ref={containerRef} className='relative mr-4'>
      <button
        type='button'
        onClick={toggle}
        aria-label='Notifications'
        className='relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100'
      >
        <IoMdNotificationsOutline size={24} />
        {unreadCount > 0 && (
          <span className='absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className='absolute right-0 top-12 w-80 max-w-[90vw] bg-white border border-gray-200 shadow-lg rounded-md z-[200]'>
          <div className='flex items-center justify-between px-4 py-2 border-b'>
            <span className='font-semibold text-sm'>Notifications</span>
            {unreadCount > 0 && (
              <button
                type='button'
                onClick={onMarkAll}
                className='text-xs text-blue-600 hover:text-blue-800'
              >
                Mark all read
              </button>
            )}
          </div>

          <div className='max-h-96 overflow-y-auto'>
            {loading ? (
              <div className='px-4 py-6 text-sm text-center text-gray-500'>
                Loading…
              </div>
            ) : items.length === 0 ? (
              <div className='px-4 py-6 text-sm text-center text-gray-500'>
                No notifications
              </div>
            ) : (
              items.map((item) => (
                <button
                  type='button'
                  key={item._id}
                  onClick={() => onItemClick(item)}
                  className={
                    'w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 ' +
                    (item.read ? 'bg-white' : 'bg-blue-50')
                  }
                >
                  <div className='flex items-start justify-between gap-2'>
                    <span className='text-sm font-medium text-gray-900'>
                      {item.title}
                    </span>
                    <span className='text-[11px] text-gray-400 whitespace-nowrap'>
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  {item.body && (
                    <p className='mt-0.5 text-xs text-gray-600'>{item.body}</p>
                  )}
                </button>
              ))
            )}
          </div>

          <button
            type='button'
            onClick={viewAll}
            className='w-full px-4 py-2 text-xs font-medium text-blue-600 border-t hover:bg-gray-50'
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
