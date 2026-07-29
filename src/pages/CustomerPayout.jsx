import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { CgSpinner } from 'react-icons/cg'

const CustomerPayout = () => {
  const { token } = useParams()
  const [payout, setPayout] = useState(null)
  const [vpa, setVpa] = useState(
    import.meta.env.VITE_HSBC_UAT_TEST_VPA || ''
  )
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts/public/${token}`,
        { headers: { 'X-Skip-Interceptor': 'true' } }
      )
      .then((response) => setPayout(response.data.data))
      .catch((requestError) =>
        setError(requestError.response?.data?.message || 'Invalid payment link')
      )
      .finally(() => setLoading(false))
  }, [token])

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/buyback-payouts/public/${token}/vpa`,
        { vpa },
        { headers: { 'X-Skip-Interceptor': 'true' } }
      )
      setPayout(response.data.data)
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to verify UPI ID'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen grid place-items-center'>
        <CgSpinner className='animate-spin text-4xl text-primary' />
      </div>
    )
  }

  const canSubmit = payout?.status === 'AWAITING_VPA'
  const isSuccessfulState = [
    'READY_FOR_PAYMENT',
    'PENDING_APPROVAL',
    'PROCESSING',
    'STATUS_UNKNOWN',
    'SUCCESS',
  ].includes(payout?.status)
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
        {canSubmit ? (
          <form onSubmit={submit} className='mt-7 space-y-4'>
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
        ) : payout ? (
          <div
            className={`mt-7 rounded-lg p-4 text-center ${
              isSuccessfulState
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <p className='font-semibold'>{payout.statusMessage}</p>
            {payout.beneficiaryVpaMasked && (
              <p className='mt-2 text-gray-600'>
                Verified UPI: {payout.beneficiaryVpaMasked}
              </p>
            )}
          </div>
        ) : null}
        {error && <p className='mt-5 text-center text-red-600'>{error}</p>}
        <p className='mt-8 text-xs text-center text-gray-500'>
          Never share your UPI PIN. GREST and HSBC will not ask for it.
        </p>
      </section>
    </main>
  )
}

export default CustomerPayout
