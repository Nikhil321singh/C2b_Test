import { useCallback, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { BeatLoader } from 'react-spinners'
import { Field, INPUT, Modal, useOncePerKey, useSubmitLock } from './WarehouseModals'
import { formatDate, formatPrice, orDash } from './constants'
import {
  bookWithBluedart,
  bulkBookWithBluedart,
  checkPincode,
  errorMessage,
  fetchBookingContext,
  fetchLabelUrl,
} from './warehouseApi'

const SUBMIT_BTN =
  'px-4 py-2 rounded bg-primary text-white text-sm font-medium min-w-[150px] disabled:opacity-60 disabled:cursor-not-allowed'
const SECONDARY_BTN = 'px-4 py-2 rounded border border-gray-300 text-sm text-gray-700'

const Section = ({ title, children }) => (
  <section className='mt-4'>
    <h3 className='font-semibold text-primary mb-2'>{title}</h3>
    {children}
  </section>
)

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const ReadOnlyBox = ({ children }) => (
  <div className='text-sm bg-gray-50 border border-gray-200 rounded px-3 py-2 text-gray-700 leading-relaxed'>
    {children}
  </div>
)

ReadOnlyBox.propTypes = { children: PropTypes.node }

const Banner = ({ tone = 'amber', children }) => {
  const tones = {
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red: 'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-800',
  }
  return <div className={`text-sm border rounded px-3 py-2 ${tones[tone]}`}>{children}</div>
}

Banner.propTypes = {
  tone: PropTypes.oneOf(['amber', 'red', 'green']),
  children: PropTypes.node,
}

/**
 * Service choice as cards; services Bluedart cannot run for this pickup are
 * shown disabled with the reason.
 */
const ServicePicker = ({ services, value, onChange }) => (
  <div className='grid grid-cols-1 sm:grid-cols-3 gap-2' role='radiogroup'>
    {services.map((service) => {
      const selected = value === service.code
      return (
        <button
          key={service.code}
          type='button'
          role='radio'
          aria-checked={selected}
          disabled={!service.available}
          onClick={() => onChange(service.code)}
          className={`text-left rounded-lg border px-3 py-2 transition-colors ${
            selected
              ? 'border-primary bg-rose-50 ring-1 ring-primary'
              : 'border-gray-300 bg-white hover:border-primary'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300`}
        >
          <span className='block text-sm font-semibold text-gray-800'>{service.label}</span>
          <span className={`block text-xs ${service.available ? 'text-green-700' : 'text-gray-500'}`}>
            {service.available ? 'Available' : service.reason}
          </span>
        </button>
      )
    })}
  </div>
)

ServicePicker.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      label: PropTypes.string,
      available: PropTypes.bool,
      reason: PropTypes.string,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
}

const openLabel = async (leadId, setError) => {
  try {
    const url = await fetchLabelUrl(leadId)
    window.open(url, '_blank', 'noopener')
  } catch (err) {
    setError(errorMessage(err, 'Label is not available'))
  }
}

/* ------------------------------ Single booking ---------------------------- */

const twoDecimals = (value) => /^\d+(\.\d{1,2})?$/.test(String(value))

export const BluedartBookingModal = ({ lead, onClose, onDone, onUseManual }) => {
  const [ctx, setCtx] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState(null)
  const [services, setServices] = useState([])
  const [pickupCheck, setPickupCheck] = useState({ city: '', error: '', checking: false })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [booked, setBooked] = useState(null)

  const withLock = useSubmitLock()
  // Pincode last checked (or being checked), so blur + Check click do not
  // call Bluedart twice for the same pincode.
  const lastPincode = useRef('')

  const loadContext = useCallback(() => {
    fetchBookingContext(lead._id)
      .then((data) => {
        lastPincode.current = data.pickup.pincode || ''
        setCtx(data)
        setServices(data.services)
        setPickupCheck({
          city: [data.pickup.city, data.pickup.state].filter(Boolean).join(', '),
          error: data.pickup.pincodeError,
          checking: false,
        })
        const firstAvailable = data.services.find((s) => s.available)
        setForm({
          serviceCode: firstAvailable?.code || '',
          pickupPincode: data.pickup.pincode,
          pickupDate: data.pickupDate.default,
          amount: String(data.package.amount),
          quantity: String(data.package.quantity),
          weight: String(data.package.weight),
          length: String(data.package.length),
          width: String(data.package.width),
          height: String(data.package.height),
        })
      })
      .catch((err) => setLoadError(errorMessage(err, 'Could not load booking details')))
  }, [lead._id])
  useOncePerKey(lead._id, loadContext)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  // When the store address has no pincode, the user types it and we check it.
  const verifyPincode = async () => {
    if (!/^[1-9]\d{5}$/.test(form.pickupPincode)) {
      setPickupCheck({ city: '', error: 'Enter a valid 6-digit pincode', checking: false })
      return
    }
    if (lastPincode.current === form.pickupPincode) {
      return
    }
    lastPincode.current = form.pickupPincode
    setPickupCheck({ city: '', error: '', checking: true })
    try {
      const info = await checkPincode(form.pickupPincode, form.amount)
      setServices(info.options)
      setPickupCheck({ city: [info.city, info.state].filter(Boolean).join(', '), error: '', checking: false })
      if (!info.options.find((s) => s.code === form.serviceCode)?.available) {
        setForm((f) => ({ ...f, serviceCode: info.options.find((s) => s.available)?.code || '' }))
      }
    } catch (err) {
      // Allow checking the same pincode again after a failure.
      lastPincode.current = ''
      setPickupCheck({ city: '', error: errorMessage(err, 'Pincode check failed'), checking: false })
    }
  }

  const pickupDay = form?.pickupDate ? new Date(`${form.pickupDate}T00:00:00`) : null
  const dateWarning = useMemo(() => {
    if (!pickupDay) {
      return ''
    }
    if (pickupDay.getDay() === 0) {
      return 'Bluedart does not pick up on Sundays.'
    }
    if (ctx?.pickup.holidays?.includes(form.pickupDate)) {
      return 'This is a Bluedart holiday at the pickup location.'
    }
    return ''
  }, [pickupDay, ctx, form])

  const validateForm = () => {
    const next = {}
    if (!form.serviceCode) {
      next.serviceCode = 'Choose a service'
    }
    if (!/^[1-9]\d{5}$/.test(form.pickupPincode)) {
      next.pickupPincode = 'Pickup pincode is required'
    }
    if (!form.pickupDate) {
      next.pickupDate = 'Choose a pickup date'
    }
    if (!twoDecimals(form.amount) || Number(form.amount) <= 0) {
      next.amount = 'Above 0, up to 2 decimals'
    }
    if (!/^\d+$/.test(form.quantity) || Number(form.quantity) < 1) {
      next.quantity = 'At least 1'
    }
    if (!twoDecimals(form.weight) || Number(form.weight) <= 0) {
      next.weight = 'Above 0 kg'
    }
    for (const key of ['length', 'width', 'height']) {
      if (!(Number(form[key]) > 0)) {
        next[key] = 'Above 0'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0 && !dateWarning
  }

  const submit = (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }
    withLock(book)
  }

  const book = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await bookWithBluedart(lead._id, {
        serviceCode: form.serviceCode,
        pickupDate: form.pickupDate,
        pickupPincode: form.pickupPincode,
        amount: Number(form.amount),
        quantity: Number(form.quantity),
        weight: Number(form.weight),
        length: Number(form.length),
        width: Number(form.width),
        height: Number(form.height),
      })
      setBooked({ message: result.message, shipment: result.data.shipment })
    } catch (err) {
      setSubmitError(errorMessage(err, 'Bluedart booking failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const title = lead.logisticsStatus === 'Cancelled' ? 'Re-transit — Via Bluedart' : 'Request Logistics — Via Bluedart'

  if (booked) {
    const { shipment } = booked
    return (
      <Modal title='Booked with Bluedart' onClose={() => onDone(booked.message)}>
        <Banner tone='green'>{booked.message}</Banner>
        <div className='mt-4 grid grid-cols-2 gap-y-2 text-sm'>
          <span className='text-gray-500'>AWB No.</span>
          <span className='font-semibold text-gray-900'>{shipment.awbNo}</span>
          <span className='text-gray-500'>Courier</span>
          <span>{shipment.courierName}</span>
          <span className='text-gray-500'>Service</span>
          <span>{shipment.serviceType}</span>
          <span className='text-gray-500'>Pickup date</span>
          <span>{formatDate(shipment.pickupDate)}</span>
          <span className='text-gray-500'>EDD</span>
          <span>{shipment.edd ? formatDate(shipment.edd) : 'Shown once tracking is available'}</span>
        </div>
        {submitError && <p className='mt-3 text-sm text-red-600'>{submitError}</p>}
        <div className='flex justify-end gap-2 mt-5'>
          {shipment.labelKey && (
            <button type='button' className={SECONDARY_BTN} onClick={() => openLabel(lead._id, setSubmitError)}>
              View / print label
            </button>
          )}
          <button type='button' className={SUBMIT_BTN} onClick={() => onDone(booked.message)}>
            Done
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={title} onClose={onClose} wide>
      <p className='text-sm text-gray-600'>
        <span className='font-semibold text-gray-800'>{lead.leadCode}</span>
        {' · '}
        {orDash(lead.deviceName)} · Lot {orDash(lead.lotCode)}
      </p>

      {!ctx && !loadError && (
        <div className='flex justify-center py-10'>
          <BeatLoader color='var(--primary-color)' />
        </div>
      )}
      {loadError && <div className='mt-4'><Banner tone='red'>{loadError}</Banner></div>}

      {ctx && form && (
        <form onSubmit={submit} noValidate>
          {!ctx.configured && (
            <div className='mt-4'>
              <Banner tone='red'>Bluedart is not configured on the server. Use Manual for now.</Banner>
            </div>
          )}
          {ctx.pickup.areaMessage && (
            <div className='mt-4'>
              <Banner>
                {ctx.pickup.areaMessage}
                {onUseManual && (
                  <button type='button' onClick={onUseManual} className='ml-2 underline font-medium'>
                    Use Manual
                  </button>
                )}
              </Banner>
            </div>
          )}

          <Section title='Service type*'>
            <ServicePicker
              services={services}
              value={form.serviceCode}
              onChange={(code) => setForm({ ...form, serviceCode: code })}
            />
            {errors.serviceCode && <p className='text-xs text-red-600 mt-1'>{errors.serviceCode}</p>}
          </Section>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Section title='Pickup (store)'>
              <ReadOnlyBox>
                <div className='font-medium text-gray-800'>{orDash(ctx.pickup.name)}</div>
                <div>{orDash(ctx.pickup.address)}</div>
                <div>Contact: {orDash(ctx.pickup.contact)}</div>
              </ReadOnlyBox>
              <div className='mt-2'>
                {ctx.pickup.pincode ? (
                  <p className='text-sm text-gray-700'>
                    Pincode <span className='font-semibold'>{ctx.pickup.pincode}</span>
                    {pickupCheck.city && <span className='text-gray-500'> · {pickupCheck.city}</span>}
                  </p>
                ) : (
                  <Field
                    label='Pickup pincode*'
                    error={errors.pickupPincode || pickupCheck.error}
                    hint={pickupCheck.city || 'Not found in the store address — please enter it'}
                  >
                    <div className='flex gap-2'>
                      <input
                        inputMode='numeric'
                        maxLength={6}
                        value={form.pickupPincode}
                        onChange={set('pickupPincode')}
                        onBlur={verifyPincode}
                        className={`${INPUT} flex-1`}
                      />
                      <button type='button' onClick={verifyPincode} className={SECONDARY_BTN}>
                        {pickupCheck.checking ? 'Checking…' : 'Check'}
                      </button>
                    </div>
                  </Field>
                )}
                {ctx.pickup.pincode && pickupCheck.error && (
                  <p className='text-xs text-red-600 mt-1'>{pickupCheck.error}</p>
                )}
              </div>
            </Section>

            <Section title='Delivery (warehouse)'>
              <ReadOnlyBox>
                <div className='font-medium text-gray-800'>{orDash(ctx.drop.name)}</div>
                <div>{orDash([ctx.drop.address1, ctx.drop.address2, ctx.drop.address3].filter(Boolean).join(', '))}</div>
                <div>
                  Pincode {orDash(ctx.drop.pincode)}
                  {ctx.drop.city ? ` · ${ctx.drop.city}` : ''}
                </div>
                <div>Contact: {orDash(ctx.drop.mobile)}</div>
              </ReadOnlyBox>
            </Section>
          </div>

          <Section title='Package'>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              <Field label='Declared value (₹)' error={errors.amount}>
                <input inputMode='decimal' value={form.amount} onChange={set('amount')} className={INPUT} />
              </Field>
              <Field label='Quantity' error={errors.quantity}>
                <input inputMode='numeric' value={form.quantity} onChange={set('quantity')} className={INPUT} />
              </Field>
              <Field label='Weight (kg)' error={errors.weight}>
                <input inputMode='decimal' value={form.weight} onChange={set('weight')} className={INPUT} />
              </Field>
              {['length', 'width', 'height'].map((key) => (
                <Field key={key} label={`${key[0].toUpperCase()}${key.slice(1)} (cm)`} error={errors[key]}>
                  <input inputMode='decimal' value={form[key]} onChange={set(key)} className={INPUT} />
                </Field>
              ))}
            </div>
          </Section>

          <Section title='Pickup date*'>
            <div className='max-w-xs'>
              <Field label='' error={errors.pickupDate || dateWarning} hint='Default is the next working day'>
                <input
                  type='date'
                  value={form.pickupDate}
                  min={ctx.pickupDate.min}
                  max={ctx.pickupDate.max}
                  onChange={set('pickupDate')}
                  className={INPUT}
                />
              </Field>
            </div>
          </Section>

          {submitError && (
            <div className='mt-4'>
              <Banner tone='red'>{submitError}</Banner>
            </div>
          )}

          <div className='flex flex-col-reverse sm:flex-row sm:justify-between gap-2 mt-6'>
            {onUseManual ? (
              <button type='button' onClick={onUseManual} className='text-sm text-primary underline self-start'>
                Arranged outside Bluedart? Use Manual
              </button>
            ) : (
              <span />
            )}
            <div className='flex justify-end gap-2'>
              <button type='button' onClick={onClose} className={SECONDARY_BTN}>
                Cancel
              </button>
              <button
                type='submit'
                disabled={submitting || !ctx.configured || !services.some((s) => s.available)}
                className={SUBMIT_BTN}
              >
                {submitting ? <BeatLoader color='#fff' size={6} /> : `Confirm booking`}
              </button>
            </div>
          </div>
          {submitting && (
            <p className='text-xs text-gray-500 text-right mt-2'>
              Booking with Bluedart… this can take a few seconds. Please don&apos;t close this window.
            </p>
          )}
        </form>
      )}
    </Modal>
  )
}

BluedartBookingModal.propTypes = {
  lead: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  onUseManual: PropTypes.func,
}

/* ------------------------------- Bulk booking ----------------------------- */

// yyyy-mm-dd in the user's local time (toISOString would shift to UTC).
const localDate = (date) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const daysFromToday = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const nextWorkingDay = () => {
  const date = daysFromToday(1)
  if (date.getDay() === 0) {
    date.setDate(date.getDate() + 1)
  }
  return localDate(date)
}

export const BulkBluedartModal = ({ leads, services, onClose, onDone }) => {
  const [serviceCode, setServiceCode] = useState(services[0]?.code || '')
  const [pickupDate, setPickupDate] = useState(nextWorkingDay())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState(null)

  const today = localDate(new Date())
  const maxDate = localDate(daysFromToday(7))
  const isSunday = new Date(`${pickupDate}T00:00:00`).getDay() === 0

  const withLock = useSubmitLock()

  const submit = (e) => {
    e.preventDefault()
    if (isSunday) {
      return
    }
    withLock(bookAll)
  }

  const bookAll = async () => {
    setSubmitting(true)
    setError('')
    try {
      const result = await bulkBookWithBluedart({
        leadIds: leads.map((l) => l._id),
        serviceCode,
        pickupDate,
      })
      setResults({ message: result.message, rows: result.data })
    } catch (err) {
      setError(errorMessage(err, 'Bulk booking failed. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const byId = new Map(leads.map((l) => [l._id, l]))

  if (results) {
    return (
      <Modal title='Bulk booking results' onClose={() => onDone(results.message)} wide>
        <Banner tone={results.rows.every((r) => r.success) ? 'green' : 'amber'}>{results.message}</Banner>
        <ul className='mt-3 divide-y border rounded'>
          {results.rows.map((row) => (
            <li key={row.leadId} className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2 text-sm'>
              <span className='font-semibold text-gray-800 sm:w-36 shrink-0'>
                {byId.get(row.leadId)?.leadCode || row.leadId}
              </span>
              {row.success ? (
                <span className='text-green-700'>
                  Booked · AWB {row.awbNo}
                  {row.pickupFailed ? ' (pickup not registered)' : ''}
                </span>
              ) : (
                <span className='text-red-600'>{row.message}</span>
              )}
            </li>
          ))}
        </ul>
        <div className='flex justify-end mt-5'>
          <button type='button' className={SUBMIT_BTN} onClick={() => onDone(results.message)}>
            Done
          </button>
        </div>
      </Modal>
    )
  }

  const totalValue = leads.reduce((sum, l) => sum + Number(l.amount || 0), 0)

  return (
    <Modal title='Request Logistics — Via Bluedart (bulk)' onClose={onClose} wide>
      <p className='text-sm text-gray-600'>
        {leads.length} item{leads.length === 1 ? '' : 's'} selected · total value {formatPrice(totalValue)}.
        Each item uses its own saved amount, weight and dimensions; items that cannot be booked are reported
        individually.
      </p>
      <ul className='mt-3 max-h-40 overflow-y-auto text-sm border rounded divide-y'>
        {leads.map((l) => (
          <li key={l._id} className='px-3 py-1.5 flex justify-between gap-3'>
            <span className='font-medium text-gray-800'>{l.leadCode}</span>
            <span className='text-gray-500 truncate'>{l.storeName}</span>
          </li>
        ))}
      </ul>
      <form onSubmit={submit}>
        <Section title='Service type*'>
          <ServicePicker
            services={services.map((s) => ({ ...s, available: true, reason: '' }))}
            value={serviceCode}
            onChange={setServiceCode}
          />
          <p className='text-xs text-gray-500 mt-1'>
            Availability is checked per item when booking.
          </p>
        </Section>
        <Section title='Pickup date*'>
          <div className='max-w-xs'>
            <Field label='' error={isSunday ? 'Bluedart does not pick up on Sundays.' : ''}>
              <input
                type='date'
                value={pickupDate}
                min={today}
                max={maxDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
        </Section>
        {error && <div className='mt-4'><Banner tone='red'>{error}</Banner></div>}
        <div className='flex justify-end gap-2 mt-6'>
          <button type='button' onClick={onClose} className={SECONDARY_BTN}>
            Cancel
          </button>
          <button type='submit' disabled={submitting || isSunday || !serviceCode} className={SUBMIT_BTN}>
            {submitting ? <BeatLoader color='#fff' size={6} /> : `Book ${leads.length} item${leads.length === 1 ? '' : 's'}`}
          </button>
        </div>
        {submitting && (
          <p className='text-xs text-gray-500 text-right mt-2'>
            Booking one by one with Bluedart… please keep this window open.
          </p>
        )}
      </form>
    </Modal>
  )
}

BulkBluedartModal.propTypes = {
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  services: PropTypes.arrayOf(
    PropTypes.shape({ code: PropTypes.string, label: PropTypes.string })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export { openLabel }
