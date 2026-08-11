import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { BsCartCheckFill } from 'react-icons/bs'
import { CgSpinner } from 'react-icons/cg'
import User_Logo from '../assets/User_Logo.jpg'

const currentDomain = window.location.origin
const DEFAULT_LOGO = '/Grest_Logo.jpg'
const BUYBACK_LOGO = '/Grest_Logo_2.jpg'
const isBuybackDomain = currentDomain === import.meta.env.VITE_BUYBACK_URL
const GREST_LOGO = isBuybackDomain ? BUYBACK_LOGO : DEFAULT_LOGO
const HOME_PATH = '/selectdevicetype'
const normalizePayout = (data) =>
  data ? { ...data, id: data.id || data._id } : data

// Ordering of payout statuses. Background polling must never move the status
// backward (a stale/cached read must not resurrect "Make Payment" after a
// payment). User actions (runAction) are always authoritative.
const STATUS_RANK = {
  AWAITING_VPA: 0,
  PENDING_APPROVAL: 1,
  READY_FOR_PAYMENT: 2,
  PROCESSING: 3,
  STATUS_UNKNOWN: 3,
  FAILED: 4,
  REJECTED: 4,
  EXPIRED: 4,
  SUCCESS: 5,
}
const rankOf = (status) => STATUS_RANK[status] ?? 0

const isBankTransfer = (payout) =>
  ['HSBC_IMPS', 'HSBC_NEFT'].includes(payout?.provider)

const isReadyForPayment = (payout) => payout?.status === 'READY_FOR_PAYMENT'

const isProcessingStatus = (payout) =>
  ['PROCESSING', 'STATUS_UNKNOWN'].includes(payout?.status)

const canResendLink = (payout) =>
  payout?.status === 'EXPIRED' ||
  payout?.status === 'FAILED' ||
  (payout?.status === 'AWAITING_VPA' &&
    payout?.linkNotificationState !== 'DELIVERED')

const getResendLinkLabel = (payout) => {
  if (payout.status === 'FAILED') {
    return isBankTransfer(payout)
      ? 'Send Link to Re-enter Bank Details'
      : 'Send Link to Re-enter UPI ID'
  }
  if (payout.status === 'AWAITING_VPA') {
    return payout.linkNotificationState === 'FAILED'
      ? 'Retry Sending Payment Link'
      : 'Pay Now – Send Customer Link'
  }
  return 'Resend Customer Link'
}

const getBeneficiaryLabel = (payout) =>
  isBankTransfer(payout) ? 'bank details' : 'UPI ID'

const shouldAcceptPollResult = (prev, next) =>
  !prev || rankOf(next?.status) >= rankOf(prev.status)

const useAutoReturn = (shouldAutoReturn, navigate) => {
  const [countdown, setCountdown] = useState(10)
  useEffect(() => {
    if (!shouldAutoReturn) {
      setCountdown(10)
      return undefined
    }
    const timer = setInterval(() => {
      setCountdown((value) => {
        if (value <= 1) {
          sessionStorage.removeItem('activePayout')
          navigate(HOME_PATH)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [shouldAutoReturn, navigate])
  return countdown
}

const PayoutStatusPanel = ({ payout, statusMessage, busy, error, onAction }) => {
  const canPay = isReadyForPayment(payout)
  const canCheck = isProcessingStatus(payout)
  const canResend = canResendLink(payout)
  const awaitingDelivered =
    payout?.status === 'AWAITING_VPA' &&
    payout?.linkNotificationState === 'DELIVERED'
  return (
    <div className='flex flex-col items-center justify-center gap-4 min-h-[65vh] px-5 text-center'>
      <BsCartCheckFill size={84} color='var(--primary-color)' />
      <p className='font-medium text-2xl'>{statusMessage}</p>
      {payout && (
        <>
          <p className='text-lg'>
            Payout amount: <strong>₹{Number(payout.amount || 0).toFixed(2)}</strong>
          </p>
          <p className='text-sm text-gray-600'>
            Status: {String(payout.status || '').replaceAll('_', ' ')}
          </p>
        </>
      )}
      {canPay && (
        <button
          disabled={busy}
          onClick={() => onAction('pay')}
          className='bg-primary text-white rounded-lg px-8 py-3 text-xl disabled:opacity-60'
        >
          {busy ? (
            <span className='flex items-center gap-2'>
              <CgSpinner className='animate-spin' /> Processing
            </span>
          ) : (
            'Make Payment'
          )}
        </button>
      )}
      {canCheck && (
        <button
          disabled={busy}
          onClick={() => onAction('status')}
          className='border-2 border-primary text-primary rounded-lg px-8 py-3 text-lg disabled:opacity-60'
        >
          Check Payment Status
        </button>
      )}
      {canResend && (
        <button
          disabled={busy}
          onClick={() => onAction('resend-link')}
          className='border-2 border-primary text-primary rounded-lg px-8 py-3 text-lg disabled:opacity-60'
        >
          {getResendLinkLabel(payout)}
        </button>
      )}
      {awaitingDelivered && (
        <p className='text-sm text-green-700'>
          Payment link sent. Waiting for the customer to provide their{' '}
          {getBeneficiaryLabel(payout)}.
        </p>
      )}
      {error && <p className='text-red-600'>{error}</p>}
    </div>
  )
}

PayoutStatusPanel.propTypes = {
  payout: PropTypes.object,
  statusMessage: PropTypes.string.isRequired,
  busy: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
}

const ProductSold = () => {
  const navigate = useNavigate()
  const profile = JSON.parse(sessionStorage.getItem('profile'))
  const savedPayout = JSON.parse(
    sessionStorage.getItem('activePayout') || 'null'
  )
  const [payout, setPayout] = useState(savedPayout)
  const [message, setMessage] = useState(
    sessionStorage.getItem('messageReceived') || ''
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const token = sessionStorage.getItem('authToken')

  const loadPayout = useCallback(async () => {
    if (!payout?.id) {
      return
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts/${payout.id}`,
        { headers: { Authorization: token } }
      )
      const nextPayout = normalizePayout(response.data.data)
      setPayout((prev) => {
        if (shouldAcceptPollResult(prev, nextPayout)) {
          sessionStorage.setItem('activePayout', JSON.stringify(nextPayout))
          return nextPayout
        }
        return prev
      })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load payout')
    }
  }, [payout?.id, token])

  useEffect(() => {
    if (!payout?.id || payout.status === 'SUCCESS') {
      return undefined
    }
    loadPayout()
    const timer = setInterval(loadPayout, 5000)
    return () => clearInterval(timer)
  }, [loadPayout, payout?.id, payout?.status])

  const isManualComplete =
    !payout &&
    message.startsWith(
      'Item Sold Successfully'
    )
  const shouldAutoReturn =
    payout?.status === 'SUCCESS' || isManualComplete
  const countdown = useAutoReturn(shouldAutoReturn, navigate)

  const runAction = async (path) => {
    setBusy(true)
    setError('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts/${payout.id}/${path}`,
        {},
        { headers: { Authorization: token } }
      )
      const nextPayout = normalizePayout(response.data.data)
      setPayout(nextPayout)
      sessionStorage.setItem('activePayout', JSON.stringify(nextPayout))
      setMessage(response.data.message)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to process payment'
      )
    } finally {
      setBusy(false)
    }
  }

  const statusMessage = payout?.statusMessage || message

  return (
    <div className='bg-white min-h-screen'>
      <div className='flex items-center w-[99%] h-16 py-4 border-b-2'>
        <div className='flex items-center justify-between w-full'>
          <div className='flex flex-row-reverse items-center gap-2 ml-4'>
            <p className='mr-4 text-base md:text-xl'>{profile?.name}</p>
            <img className='w-[30px]' src={User_Logo} alt='' />
          </div>
          <img
            onClick={() => navigate(HOME_PATH)}
            className='w-40 cursor-pointer'
            src={GREST_LOGO}
            alt='app logo'
          />
        </div>
      </div>

      <PayoutStatusPanel
        payout={payout}
        statusMessage={statusMessage}
        busy={busy}
        error={error}
        onAction={runAction}
      />

      {shouldAutoReturn && (
        <div className='fixed bottom-0 w-full'>
          <button
            onClick={() => navigate(HOME_PATH)}
            className='bg-primary mb-20 p-3 mx-2 text-lg rounded-lg text-white w-[calc(100%-1rem)]'
          >
            Return To Home ({countdown}s)
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductSold
