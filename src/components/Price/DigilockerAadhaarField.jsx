import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import {
  initiateDigiLockerSession,
  getDigiLockerAccessToken,
  getDigiLockerIssuedFiles,
  downloadDigiLockerXml,
  DIGILOCKER_REDIRECT_URL,
} from '../../services/digilockerAadhaarService'
import ConsentCheckbox from '../ConsentCheckbox'
import { AADHAR_LENGTH } from '../../constants/priceConstants'

const DISABLED_BTN = 'bg-gray-400 cursor-not-allowed'
const PINK = 'bg-primary'
const GREEN = 'bg-green-500 cursor-not-allowed'

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    return JSON.parse(atob(base64))
  } catch (e) {
    console.error('Failed to decode encdata JWT:', e)
    return null
  }
}

const getButtonClass = (
  isVerified,
  isVerificationRequired,
  isInitiating,
  isProcessing,
) => {
  if (isVerified) {
    return GREEN
  }
  if (!isVerificationRequired) {
    return DISABLED_BTN
  }
  if (isInitiating || isProcessing) {
    return DISABLED_BTN
  }
  return PINK
}

const getButtonText = (isVerified, isProcessing, isInitiating, isManualEntry) => {
  if (isVerified) {
    return isManualEntry ? 'Aadhaar Submitted Manually' : 'Verified via DigiLocker'
  }
  if (isProcessing) {
    return 'Processing...'
  }
  if (isInitiating) {
    return 'Redirecting...'
  }
  return 'Verify via DigiLocker'
}

const DigilockerAadhaarField = ({
  aadharNumber,
  setAadharNumber,
  isVerified,
  setIsVerified,
  aadharVerificationReason,
  setAadharVerificationReason,
  isVerificationRequired = true,
  isDevelopmentMode = false,
}) => {
  const [error, setError] = useState('')
  const [isInitiating, setIsInitiating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aadhaarConsent, setAadhaarConsent] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [verifiedAadhaarNumber, setVerifiedAadhaarNumber] = useState('')
  const [hasFailed, setHasFailed] = useState(false)
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [manualAadharNumber, setManualAadharNumber] = useState('')
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [reasonInput, setReasonInput] = useState('')
  const refidRef = useRef('')
  const setRefid = (value) => {
    refidRef.current = value
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let callbackRefid = params.get('refid')

    if (!callbackRefid) {
      const encdata = params.get('encdata')
      if (encdata) {
        const decoded = decodeJwtPayload(encdata)
        callbackRefid = decoded?.data?.refid
      }
    }

    if (callbackRefid) {
      setRefid(callbackRefid)
      handleDigiLockerCallback(callbackRefid)
    }
  }, [])

  // The DigiLocker step is the only step that leaves the app via a real,
  // full-page navigation (window.location.href to DigiLocker and back).
  // That makes this page eligible for the browser's back-forward cache
  // (bfcache): pressing the native Back/Forward buttons can restore this
  // exact page instance frozen in time, complete with whichever Aadhaar
  // record happened to be verified in it, instead of a fresh mount.
  // Detect that restoration and reset verification state so a stale/old
  // record is never shown as already verified for what should be a new flow.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        setIsVerified(false)
        setAadharNumber('')
        setVerifiedAadhaarNumber('')
        setStatusMessage('')
        setError('')
        setHasFailed(false)
        setRefid('')
        setIsManualEntry(false)
        setManualAadharNumber('')
        setAadharVerificationReason('')
        setShowReasonModal(false)
        setReasonInput('')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const handleDigiLockerCallback = async (callbackRefid) => {
    setIsProcessing(true)
    setStatusMessage('Completing DigiLocker verification...')

    try {
      await getDigiLockerAccessToken(callbackRefid)

      const files = await getDigiLockerIssuedFiles(callbackRefid)

      const aadhaarDoc = files?.find(
        (doc) =>
          doc.doctype === 'ADHAR' ||
          doc.name?.toLowerCase().includes('aadhaar'),
      )

      if (!aadhaarDoc) {
        throw new Error('Aadhaar document not found in DigiLocker')
      }

      const kycResponse = await downloadDigiLockerXml(
        callbackRefid,
        aadhaarDoc.uri,
      )

      const maskedNumber = kycResponse?.aadhaarNumber
      if (maskedNumber) {
        setVerifiedAadhaarNumber(maskedNumber)
      }

      setAadharNumber(maskedNumber || 'DigiLocker Verified')
      setIsVerified(true)
      setError('')
      setStatusMessage('Aadhaar verified successfully via DigiLocker!')
      toast.success('Aadhaar verified via DigiLocker!')

      window.history.replaceState({}, '', window.location.pathname)
    } catch (err) {
      console.error('DigiLocker callback error:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to complete DigiLocker verification'
      setError(errorMessage)
      setHasFailed(true)
      toast.error(errorMessage)
      setStatusMessage('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleInitiateDigiLocker = async () => {
    if (!aadhaarConsent) {
      toast.error('Please provide consent for Aadhaar collection')
      return
    }

    setIsInitiating(true)
    setError('')
    setHasFailed(false)
    setVerifiedAadhaarNumber('')
    setIsManualEntry(false)
    setManualAadharNumber('')
    setAadharVerificationReason('')

    try {
      const sessionId = `DL-${Date.now()}${Math.floor(Math.random() * 1e6)}`
      setRefid(sessionId)

      const sessionResult = await initiateDigiLockerSession(
        sessionId,
        DIGILOCKER_REDIRECT_URL,
      )

      if (!sessionResult?.authorization_url) {
        throw new Error('Failed to get DigiLocker authorization URL')
      }

      setStatusMessage('Redirecting to DigiLocker...')

      window.location.href = sessionResult.authorization_url
    } catch (err) {
      console.error('Initiate DigiLocker error:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to initiate DigiLocker verification'
      setError(errorMessage)
      setHasFailed(true)
      toast.error(errorMessage)
      setIsInitiating(false)
    }
  }

  const handleManualAadharChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    setManualAadharNumber(value)
  }

  const handleManualSubmit = () => {
    const cleaned = manualAadharNumber.replace(/\D/g, '')
    if (cleaned.length !== AADHAR_LENGTH) {
      toast.error(`Aadhaar number must be exactly ${AADHAR_LENGTH} digits.`)
      return
    }
    if (!reasonInput.trim()) {
      toast.error('Please provide a reason for manual Aadhaar entry')
      return
    }

    setAadharNumber(cleaned)
    setVerifiedAadhaarNumber(cleaned)
    setAadharVerificationReason(reasonInput.trim())
    setIsManualEntry(true)
    setIsVerified(true)
    setError('')
    setShowReasonModal(false)
    toast.success('Aadhaar number submitted with reason')
  }

  return (
    <div className='flex flex-col eminumber mt-[4px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>2.</p>
        <p className='text-base font-medium three'>
          Aadhaar Verification via DigiLocker
          {isDevelopmentMode ? (
            <span className='text-gray-400 text-sm ml-1'>
              (optional in development)
            </span>
          ) : (
            <span className='text-red-500'>*</span>
          )}
        </p>
      </div>

      {verifiedAadhaarNumber && (
        <div className='flex items-center gap-4 mt-2 ml-[19px]'>
          <div className='flex items-center p-2 border-2 border-gray-300 rounded'>
            <input
              type='text'
              className='w-auto outline-none'
              value={verifiedAadhaarNumber}
              placeholder='Aadhaar No.'
              readOnly
            />
          </div>
        </div>
      )}

      <div className='flex flex-wrap items-center gap-4 mt-2 ml-[19px]'>
        <button
          className={`px-4 py-2 font-bold text-white rounded ${getButtonClass(
            isVerified,
            isVerificationRequired,
            isInitiating,
            isProcessing,
          )}`}
          onClick={handleInitiateDigiLocker}
          disabled={
            !isVerificationRequired || isVerified || isInitiating || isProcessing
          }
        >
          {getButtonText(isVerified, isProcessing, isInitiating, isManualEntry)}
        </button>

        {hasFailed && !isVerified && (
          <button
            className='px-4 py-2 font-bold text-white rounded bg-primary hover:opacity-90'
            onClick={handleInitiateDigiLocker}
            disabled={isInitiating || isProcessing}
          >
            Retry
          </button>
        )}

        {!isVerificationRequired && (
          <span className='text-sm text-primary'>
            Note: Aadhaar Verification not required at this time. Please proceed
            ahead.
          </span>
        )}
      </div>

      {/* Manual fallback: shown when Aadhaar verification is turned off for
          this company, or DigiLocker failed/errored (session couldn't be
          initiated, Aadhaar not found, etc.) so the flow is never blocked. */}
      {(!isVerificationRequired || hasFailed) && !isVerified && (
        <div className='flex flex-col mt-2 ml-[19px]'>
          <div className='flex flex-wrap items-center gap-4'>
            <input
              type='text'
              className='w-auto p-2 border-2 border-gray-300 rounded outline-none'
              value={manualAadharNumber}
              placeholder='Enter Aadhaar Number'
              onChange={handleManualAadharChange}
              maxLength={12}
            />
          </div>
          <button
            type='button'
            className='text-sm text-primary underline mt-1 w-fit text-left'
            onClick={() => setShowReasonModal(true)}
          >
            + Add Reason &amp; Submit Aadhaar
          </button>
        </div>
      )}

      {isManualEntry && aadharVerificationReason && (
        <p className='text-xs text-gray-600 mt-1 ml-[19px]'>
          Reason: {aadharVerificationReason}
        </p>
      )}

      {showReasonModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='relative p-4 mx-auto bg-white rounded shadow-lg w-80'>
            <h2 className='text-lg font-bold'>Reason for Manual Aadhaar Entry</h2>
            <textarea
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className='w-full p-2 mt-2 border rounded outline-none'
              rows={3}
              placeholder='Why is Aadhaar being entered manually?'
            />
            <div className='flex justify-end mt-4 gap-2'>
              <button
                type='button'
                onClick={() => setShowReasonModal(false)}
                className='px-4 py-2 text-white bg-gray-500 rounded'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleManualSubmit}
                className='px-4 py-2 font-bold text-white rounded bg-primary hover:opacity-90'
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <p className='text-green-600 mt-2 text-sm ml-[19px]'>{statusMessage}</p>
      )}

      {error && typeof error === 'string' && (
        <p className='text-primary mt-2 text-sm ml-[19px]'>{error}</p>
      )}

      <div className='mt-4 ml-[19px]'>
        <ConsentCheckbox
          consentType='aadhaar_collection'
          onConsentChange={setAadhaarConsent}
          required={!isDevelopmentMode}
        />
      </div>
    </div>
  )
}

export default DigilockerAadhaarField
