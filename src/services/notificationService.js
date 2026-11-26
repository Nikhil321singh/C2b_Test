import axiosInstance from '../utils/axiosInterceptor'

// In-app notification API wrappers. Uses the shared axios instance, which
// injects the auth token and handles 401/403/network errors globally.

export const fetchNotifications = async ({
  unread = false,
  page = 0,
  limit = 20,
} = {}) => {
  const params = { page, limit }
  if (unread) {
    params.unread = 'true'
  }
  const { data } = await axiosInstance.get('/api/notifications', { params })
  return data?.data || { items: [], total: 0, unreadCount: 0, page, limit }
}

export const fetchUnreadCount = async () => {
  const { data } = await axiosInstance.get('/api/notifications/unread-count')
  return data?.data?.unreadCount || 0
}

export const markNotificationRead = async (id) => {
  const { data } = await axiosInstance.post(`/api/notifications/${id}/read`)
  return data
}

export const markAllNotificationsRead = async () => {
  const { data } = await axiosInstance.post('/api/notifications/read-all')
  return data
}

// Map a notification to the in-app route that shows its subject. Returns null
// when there is no meaningful destination.
export const notificationTargetPath = (item) => {
  switch (item?.entityType) {
    case 'storePayment':
      return '/store-payments'
    case 'buybackPayout':
      return '/payout-management'
    default:
      return null
  }
}
