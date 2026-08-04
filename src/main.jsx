import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import CustomerPayout from './pages/CustomerPayout.jsx'
import './index.css'
import { DataProvider } from './components/dataContext.jsx'
import logger from './utils/logger.js'

// DPDP Compliance: Replace global console with secure logger to prevent PII leakage
logger.replaceGlobalConsole()

const currentDomain = window.location.origin

// Read environment variables
const WEBSITE_TITLE = import.meta.env.VITE_WEBSITE_TITLE || 'Grest'
const BUYBACK_TITLE = import.meta.env.VITE_WEBSITE_GREST_TITLE || 'Grest'
const DEFAULT_FAVICON = '/Grest_Short.jpg'
const BUYBACK_FAVICON = '/Buyback_Logo.jpg' // Use your actual buyback logo

const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL

// Set the document title
document.title = isBuybackDomain ? BUYBACK_TITLE : WEBSITE_TITLE

// Dynamically set favicon
const updateFavicon = (faviconPath) => {
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    document.head.appendChild(link)
  }
  link.href = faviconPath
}

// Set favicon based on domain
updateFavicon(isBuybackDomain ? BUYBACK_FAVICON : DEFAULT_FAVICON)

const isPublicPayoutPath = window.location.pathname.startsWith('/payout/')

// The customer payout page is intentionally rendered outside the authenticated
// application shell. This prevents session timers, role redirects and global
// Axios interceptors from navigating a customer away while their UPI ID is
// being verified.
const root = isPublicPayoutPath ? (
  <BrowserRouter>
    <Routes>
      <Route path='/payout/:token' element={<CustomerPayout />} />
    </Routes>
  </BrowserRouter>
) : (
  <DataProvider>
    <App />
  </DataProvider>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>{root}</React.StrictMode>,
)
