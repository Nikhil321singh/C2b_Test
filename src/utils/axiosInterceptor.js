import axios from 'axios'
import toast from 'react-hot-toast'

// Constants
const TOAST_POSITION = 'top-center'

// Track active toasts to prevent duplicates
const activeToasts = {
  401: null,
  403: null,
  429: null,
  network: null,
}

// Track if we've already started redirecting
let isRedirecting = false

// Helper function to show toast only once per error type
const showToastOnce = (key, message, options) => {
  // If this toast is already showing, don't show another
  if (activeToasts[key]) {
    console.log(`[Toast Blocked] Duplicate ${key} toast prevented`)
    return
  }

  console.log(`[Toast Shown] ${key}: ${message}`)

  // Show the toast and store its ID
  const toastId = toast.error(message, {
    ...options,
    onClose: () => {
      // Clear the active toast when it closes
      console.log(`[Toast Closed] ${key} toast closed, tracking cleared`)
      activeToasts[key] = null
    },
  })

  activeToasts[key] = toastId
  return toastId
}

// Helper function to handle logout
const handleLogout = (message) => {
  if (isRedirecting) {
    return // Prevent duplicate redirects
  }
  isRedirecting = true

  // Clear session storage
  sessionStorage.removeItem('authToken')
  sessionStorage.removeItem('userProfile')
  sessionStorage.removeItem('role')

  // Show toast notification (only once)
  showToastOnce('401', message, {
    duration: 3000,
    position: TOAST_POSITION,
  })

  // Redirect to login page after short delay
  setTimeout(() => {
    isRedirecting = false
    window.location.href = '/'
  }, 1500)
}

// Response error handler (shared between all axios instances)
const handleResponseError = (error) => {
  if (error.response) {
    const { status, data } = error.response

    // Handle 401 Unauthorized - Session expired
    if (status === 401) {
      const message = data?.message || 'Session expired. Please login again.'
      handleLogout(message)
      return Promise.reject(new Error(message))
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const message =
        data?.message || data?.msg || 'Access denied. Insufficient permissions.'
      showToastOnce('403', message, {
        duration: 4000,
        position: TOAST_POSITION,
      })
      return Promise.reject(new Error(message))
    }

    // Handle 429 Too Many Requests
    if (status === 429) {
      const message =
        data?.message || 'Too many requests. Please try again later.'
      showToastOnce('429', message, {
        duration: 5000,
        position: TOAST_POSITION,
      })
      return Promise.reject(new Error(message))
    }
  }

  // Handle network errors
  if (!error.response) {
    const message = 'Network error. Please check your connection.'
    showToastOnce('network', message, {
      duration: 4000,
      position: TOAST_POSITION,
    })
    return Promise.reject(new Error(message))
  }

  return Promise.reject(error)
}

// Request interceptor (shared)
const handleRequest = (config) => {
  const token = sessionStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = token
  }
  return config
}

// Track if global interceptors have been set up
let globalInterceptorsSetup = false

// Setup interceptors for the default axios instance (global)
export const setupGlobalInterceptors = () => {
  if (globalInterceptorsSetup) {
    console.log('[Axios] Global interceptors already setup, skipping')
    return
  }

  console.log('[Axios] Setting up global interceptors')
  globalInterceptorsSetup = true

  // Remove any existing interceptors to avoid duplicates
  axios.interceptors.request.handlers = []
  axios.interceptors.response.handlers = []

  // Add request interceptor
  axios.interceptors.request.use(handleRequest, (error) =>
    Promise.reject(error)
  )

  // Add response interceptor
  axios.interceptors.response.use((response) => response, handleResponseError)
}

// Create custom axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_ENDPOINT,
  timeout: 30000,
})

// Add interceptors to custom instance
axiosInstance.interceptors.request.use(handleRequest, (error) =>
  Promise.reject(error)
)
axiosInstance.interceptors.response.use(
  (response) => response,
  handleResponseError
)

export default axiosInstance
