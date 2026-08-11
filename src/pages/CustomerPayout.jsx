import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { CgSpinner } from 'react-icons/cg'

// Customer payout links are public. Keep these requests isolated from the
// authenticated application's global interceptor, which redirects 401
// responses to the login page.
const publicPayoutApi = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_ENDPOINT,
  timeout: 30000,
})

const BANK_PROVIDERS = ['HSBC_IMPS', 'HSBC_NEFT']
const IFSC_PATTERN = /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/
// Mirrors the backend UPI VPA pattern so a malformed UPI ID is caught before submit.
const VPA_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/

// Only a confirmed payment may look like one. An in-flight or unconfirmed
// payout reads as "in progress", never as money received.
const getStatusTone = (status) => {
  if (status === 'SUCCESS') {
    return 'bg-green-50 text-green-800'
  }
  if (
    ['READY_FOR_PAYMENT', 'PENDING_APPROVAL', 'PROCESSING', 'STATUS_UNKNOWN'].includes(
      status,
    )
  ) {
    return 'bg-amber-50 text-amber-800'
  }
  return 'bg-red-50 text-red-700'
}

const BankDetailsForm = ({ bank, onBankChange, submitting, onSubmit }) => (
  <form onSubmit={onSubmit} className='mt-7 space-y-4'>
    <div>
      <label className='block font-medium mb-2'>Bank account number</label>
      <input
        value={bank.accountNumber}
        onChange={onBankChange('accountNumber')}
        inputMode='numeric'
        autoComplete='off'
        required
        className='border-2 rounded-lg px-4 py-3 w-full'
      />
    </div>
    <div>
      <label className='block font-medium mb-2'>Confirm account number</label>
      <input
        value={bank.confirmAccountNumber}
        onChange={onBankChange('confirmAccountNumber')}
        inputMode='numeric'
        autoComplete='off'
        onPaste={(event) => event.preventDefault()}
        required
        className='border-2 rounded-lg px-4 py-3 w-full'
      />
    </div>
    <div>
      <label className='block font-medium mb-2'>IFSC code</label>
      <input
        value={bank.ifsc}
        onChange={onBankChange('ifsc')}
        placeholder='HDFC0000007'
        autoCapitalize='characters'
        autoComplete='off'
        required
        className='border-2 rounded-lg px-4 py-3 w-full uppercase'
      />
    </div>
    <div>
      <label className='block font-medium mb-2'>Account holder name</label>
      <input
        value={bank.accountName}
        onChange={onBankChange('accountName')}
        autoComplete='off'
        className='border-2 rounded-lg px-4 py-3 w-full'
      />
    </div>
    <p className='text-sm text-gray-600'>
      Enter the account to receive your payment. Please check the details
      carefully — payments cannot be reversed.
    </p>
    <button
      disabled={submitting}
      className='w-full bg-primary text-white rounded-lg py-3 font-semibold disabled:opacity-60'
    >
      {submitting ? 'Saving…' : 'Submit bank details'}
    </button>
  </form>
)

BankDetailsForm.propTypes = {
  bank: PropTypes.shape({
    accountNumber: PropTypes.string,
    confirmAccountNumber: PropTypes.string,
    ifsc: PropTypes.string,
    accountName: PropTypes.string,
  }).isRequired,
  onBankChange: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

const VpaForm = ({ vpa, setVpa, submitting, onSubmit }) => (
  <form onSubmit={onSubmit} className='mt-7 space-y-4'>
    <div>
      <label className='block font-medium mb-2'>Your UPI ID</label>
      <input
        value={vpa}
        onChange={(event) => setVpa(event.target.value)}
        placeholder='name@bank'
        autoCapitalize='none'
        autoComplete='off'
        required
        className='border-2 rounded-lg px-4 py-3 w-full'
      />
    </div>
    <p className='text-sm text-gray-600'>
      HSBC will verify the UPI ID before the store initiates payment.
    </p>
    <button
      disabled={submitting}
      className='w-full bg-primary text-white rounded-lg py-3 font-semibold disabled:opacity-60'
    >
      {submitting ? 'Verifying…' : 'Verify UPI ID'}
    </button>
  </form>
)

VpaForm.propTypes = {
  vpa: PropTypes.string.isRequired,
  setVpa: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

const PayoutStatusPanel = ({ payout }) => {
  const statusTone = getStatusTone(payout.status)
  return (
    <div className={`mt-7 rounded-lg p-4 text-center ${statusTone}`}>
      <p className='font-semibold'>{payout.statusMessage}</p>
      {payout.beneficiaryVpaMasked && (
        <p className='mt-2 text-gray-600'>
          Verified UPI: {payout.beneficiaryVpaMasked}
        </p>
      )}
      {payout.beneficiaryAccountMasked && (
        <p className='mt-2 text-gray-600'>
          Account: {payout.beneficiaryAccountMasked}
        </p>
      )}
    </div>
  )
}

PayoutStatusPanel.propTypes = {
  payout: PropTypes.shape({
    status: PropTypes.string,
    statusMessage: PropTypes.string,
    beneficiaryVpaMasked: PropTypes.string,
    beneficiaryAccountMasked: PropTypes.string,
  }).isRequired,
}

const CustomerPayout = () => {
  const { token } = useParams()
  const [payout, setPayout] = useState(null)
  const [vpa, setVpa] = useState(import.meta.env.VITE_HSBC_UAT_TEST_VPA || '')
  const [bank, setBank] = useState({
    accountNumber: '',
    confirmAccountNumber: '',
    ifsc: '',
    accountName: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    publicPayoutApi
      .get(`/api/buyback-payouts/public/${token}`)
      .then((response) => setPayout(response.data.data))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || 'Invalid payment link'),
      )
      .finally(() => setLoading(false))
  }, [token])

  const isBankTransfer = BANK_PROVIDERS.includes(payout?.provider)

  const submitVpa = async (event) => {
    event.preventDefault()
    setError('')
    if (!VPA_PATTERN.test(vpa.trim())) {
      setError('Enter a valid UPI ID (e.g. name@bank)')
      return
    }
    setSubmitting(true)
    try {
      const response = await publicPayoutApi.post(
        `/api/buyback-payouts/public/${token}/vpa`,
        { vpa },
      )
      setPayout(response.data.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify UPI ID')
    } finally {
      setSubmitting(false)
    }
  }

  const submitBank = async (event) => {
    event.preventDefault()
    setError('')
    if (bank.accountNumber !== bank.confirmAccountNumber) {
      setError('Account numbers do not match')
      return
    }
    if (!IFSC_PATTERN.test(bank.ifsc.trim())) {
      setError('Enter a valid IFSC code (e.g. HDFC0000007)')
      return
    }
    setSubmitting(true)
    try {
      const response = await publicPayoutApi.post(
        `/api/buyback-payouts/public/${token}/bank`,
        {
          accountNumber: bank.accountNumber.trim(),
          ifsc: bank.ifsc.trim().toUpperCase(),
          accountName: bank.accountName.trim(),
        },
      )
      setPayout(response.data.data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to save bank details',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const onBankChange = (field) => (event) =>
    setBank((prev) => ({ ...prev, [field]: event.target.value }))

  if (loading) {
    return (
      <div className='min-h-screen grid place-items-center'>
        <CgSpinner className='animate-spin text-4xl text-primary' />
      </div>
    )
  }

  const canSubmit = payout?.status === 'AWAITING_VPA'

  let content = null
  if (canSubmit && isBankTransfer) {
    content = (
      <BankDetailsForm
        bank={bank}
        onBankChange={onBankChange}
        submitting={submitting}
        onSubmit={submitBank}
      />
    )
  } else if (canSubmit) {
    content = (
      <VpaForm
        vpa={vpa}
        setVpa={setVpa}
        submitting={submitting}
        onSubmit={submitVpa}
      />
    )
  } else if (payout) {
    content = <PayoutStatusPanel payout={payout} />
  }

  const footerMessage = isBankTransfer
    ? 'GREST and HSBC will never ask for your bank password or OTP.'
    : 'Never share your UPI PIN. GREST and HSBC will not ask for it.'

  return (
    <main className='min-h-screen bg-gray-50 px-4 py-10'>
      <section className='max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6'>
        <img src='/Grest_Logo.jpg' alt='GREST' className='w-36 mx-auto mb-6' />
        <h1 className='text-2xl font-semibold text-center'>
          Receive your device payment
        </h1>
        {payout && (
          <p className='text-center text-3xl font-bold mt-4'>
            ₹{Number(payout.amount).toFixed(2)}
          </p>
        )}
        {content}
        {error && <p className='mt-5 text-center text-red-600'>{error}</p>}
        <p className='mt-8 text-xs text-center text-gray-500'>{footerMessage}</p>
      </section>
    </main>
  )
}

export default CustomerPayout
