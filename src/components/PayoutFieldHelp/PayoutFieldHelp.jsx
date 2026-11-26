import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { IoClose } from 'react-icons/io5'

// Plain-language help for the company-level HSBC payout fraud limits.
const PAYOUT_FIELD_HELP = {
  deviceCooldownDays: {
    title: 'Device cooldown (days)',
    summary:
      'Stops the same phone from being bought and paid out again within this many days.',
    points: [
      'The phone is identified by its IMEI number.',
      'If the same IMEI was already sold within this period, the HSBC payout is blocked.',
      'The IMEI must be entered on the sale whenever this limit is switched on.',
    ],
    example:
      'Set to 30: a phone sold on 1 March cannot receive another payout until 31 March.',
    zeroMeans: 'No cooldown. The same phone can be sold again at any time.',
  },
  customerSellLimitCount: {
    title: 'Customer device limit',
    summary:
      'The maximum number of devices one customer can sell within the limit window.',
    points: [
      "The customer is identified by their mobile number.",
      'Once the limit is reached, further HSBC payouts for that customer are blocked until older sales fall outside the window.',
      'Must be set together with "Customer limit window (days)".',
    ],
    example:
      'Set to 3 with a 30-day window: a customer can sell 3 devices in any 30 days. The 4th is blocked.',
    zeroMeans: 'No limit on how many devices a customer can sell.',
  },
  customerSellLimitWindowDays: {
    title: 'Customer limit window (days)',
    summary:
      'The period, counted back from today, over which the customer device limit is checked.',
    points: [
      'Works together with "Customer device limit". Set both, or leave both at 0.',
      'The window moves every day, so older sales stop counting automatically.',
    ],
    example:
      'Set to 30 with a device limit of 3: only sales from the last 30 days are counted.',
    zeroMeans: 'No window. The customer device limit is not applied.',
  },
  payoutCeiling: {
    title: 'Store payout ceiling (₹)',
    summary:
      'The highest single payout this store is allowed to make through HSBC.',
    points: [
      'A sale above this amount is blocked before the customer payment link is created.',
      'Store staff are asked to contact the Company Admin or Super Admin. The ceiling amount itself is not shown to them.',
    ],
    example:
      'Set to 25,000: a ₹30,000 payout is blocked, while a ₹20,000 payout goes ahead.',
    zeroMeans:
      'The store has no ceiling of its own, so the system default ceiling applies (₹50,000 unless your team has set a different default).',
  },
  approvalThreshold: {
    title: 'Approval amount (₹)',
    summary:
      'Payouts of this amount or more must be approved before the customer is paid.',
    points: [
      'Works only when "Require approval above configured amount" is ticked.',
      'A Manager, Admin Manager, Company Admin or Super Admin approves or rejects the payout.',
      'Payouts below this amount are sent without waiting for approval.',
    ],
    example:
      'Set to 10,000: a ₹12,000 payout waits for approval, while a ₹8,000 payout is sent straight away.',
    zeroMeans: 'Every HSBC payout needs approval (when approval is ticked).',
  },
  customerLinkExpiryMinutes: {
    title: 'Customer link expiry (minutes)',
    summary: 'How long the payment link sent to the customer stays valid.',
    points: [
      'The customer must open the link and enter their UPI ID or bank details within this time.',
      'Allowed range is 5 to 1440 minutes (24 hours). The default is 30 minutes.',
      'If the link expires, staff can send a fresh link from Customer Payouts.',
    ],
    example: 'Set to 30: a link sent at 2:00 pm stops working at 2:30 pm.',
  },
}

const PayoutHelpModal = ({ help, onClose }) => {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className='fixed inset-0 z-[400] flex items-center justify-center bg-black bg-opacity-50 p-4'
      onClick={onClose}
      role='presentation'
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='payout-help-title'
        className='w-full max-w-md rounded-xl bg-white shadow-xl'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-gray-200 px-5 py-3'>
          <h2
            id='payout-help-title'
            className='flex items-center gap-2 text-base font-semibold text-gray-800'
          >
            <AiOutlineQuestionCircle className='text-primary' size={20} />
            {help.title}
          </h2>
          <button
            type='button'
            aria-label='Close'
            className='rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            onClick={onClose}
          >
            <IoClose size={20} />
          </button>
        </div>

        <div className='space-y-4 px-5 py-4 text-sm text-gray-700'>
          <p className='font-medium text-gray-800'>{help.summary}</p>

          {help.options && (
            <dl className='space-y-2'>
              {help.options.map(([name, description]) => (
                <div
                  key={name}
                  className='rounded-lg border border-gray-200 px-3 py-2'
                >
                  <dt className='font-medium text-gray-800'>{name}</dt>
                  <dd className='mt-0.5 text-gray-600'>{description}</dd>
                </div>
              ))}
            </dl>
          )}

          <ul className='list-disc space-y-1.5 pl-5'>
            {help.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <div className='rounded-lg border border-blue-100 bg-blue-50 px-3 py-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-blue-700'>
              Example
            </p>
            <p className='mt-1 text-blue-900'>{help.example}</p>
          </div>

          {help.zeroMeans && (
            <div className='rounded-lg border border-gray-200 bg-gray-50 px-3 py-2'>
              <p className='text-xs font-semibold uppercase tracking-wide text-gray-600'>
                Set to 0
              </p>
              <p className='mt-1'>{help.zeroMeans}</p>
            </div>
          )}

          <p className='text-xs text-gray-500'>
            Applies only when HSBC payout is enabled for both the company and
            the store.
          </p>
        </div>

        <div className='flex justify-end border-t border-gray-200 px-5 py-3'>
          <button
            type='button'
            className='rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:opacity-90'
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

PayoutHelpModal.propTypes = {
  help: PropTypes.shape({
    title: PropTypes.string.isRequired,
    summary: PropTypes.string.isRequired,
    points: PropTypes.arrayOf(PropTypes.string).isRequired,
    example: PropTypes.string.isRequired,
    zeroMeans: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
}

// Field label followed by a help icon that opens an explanation dialog.
const PayoutFieldHelp = ({ label, field }) => {
  const [open, setOpen] = useState(false)
  const help = PAYOUT_FIELD_HELP[field]
  if (!help) {
    return label
  }
  return (
    <span className='inline-flex items-center gap-1.5'>
      {label}
      <button
        type='button'
        aria-label={`What is ${help.title}?`}
        title={`What is ${help.title}?`}
        className='text-gray-400 transition hover:text-primary focus:text-primary focus:outline-none'
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
      >
        <AiOutlineQuestionCircle size={16} />
      </button>
      {open && <PayoutHelpModal help={help} onClose={() => setOpen(false)} />}
    </span>
  )
}

PayoutFieldHelp.propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
}

export default PayoutFieldHelp
