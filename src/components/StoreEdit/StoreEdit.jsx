import { useState, useEffect } from 'react'
import { BeatLoader } from 'react-spinners'
import axios from 'axios'
import { IoClose } from 'react-icons/io5'

const FORM_FIELDS = [
  {
    label: 'Store Name',
    name: 'storeName',
    type: 'text',
    disabled: false,
  },
  {
    label: 'Unique Id',
    name: 'uniqueId',
    type: 'text',
    disabled: true,
  },
  { label: 'Email', name: 'email', type: 'email', disabled: false },
  {
    label: 'Contact Number',
    name: 'contactNumber',
    type: 'number',
    disabled: false,
  },
  {
    label: 'Region',
    name: 'region',
    type: 'text',
    disabled: false,
  },
  {
    label: 'Adddress',
    name: 'address',
    type: 'text',
    disabled: false,
  },
]

const validateFormData = (formData, setResponse, setIsTableLoaded) => {
  if (formData.email.length <= 5) {
    setResponse('Email size is too small, must be more than 5')
    setIsTableLoaded(false)
    return false
  }

  if (formData.contactNumber.length <= 5) {
    setResponse('Phone number is invalid, size must be more than 5')
    setIsTableLoaded(false)
    return false
  }

  return true
}

const CompanyDropdown = ({ companies, formData, setFormData }) => (
  <div className='flex flex-col gap-2 w-full md:w-[70%]'>
    <label className='font-medium text-base md:text-xl'>Company*</label>
    <select
      name='companyId'
      value={formData?.companyId?._id || ''}
      onChange={(e) => {
        const selectedCompany = companies.find((c) => c._id === e.target.value)
        setFormData({
          ...formData,
          companyId: {
            _id: selectedCompany._id,
            name: selectedCompany.companyName,
            companyCode: selectedCompany.companyCode,
          },
        })
      }}
      required
      className='border-2 px-3 py-2 rounded-lg outline-none'
    >
      <option value=''>Select a company</option>
      {companies.map((company) => (
        <option key={company._id} value={company._id}>
          {company.name}
        </option>
      ))}
    </select>
  </div>
)

const FormField = ({ label, name, type, disabled, value, onChange }) => (
  <div className='flex flex-col gap-2 w-full md:w-[70%]'>
    <label className='font-medium text-base md:text-xl'>{label}*</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required
      disabled={disabled}
      className={`border-2 px-3 py-2 rounded-lg outline-none ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : ''
      }`}
    />
  </div>
)

const StoreEdit = ({ storeData, setEditBoxOpen, setEditSuccess }) => {
  const [isTableLoaded, setIsTableLoaded] = useState(false)
  const [formData, setFormData] = useState({
    ...storeData,
    payoutSettings: {
      enabled: false,
      mode: 'MANUAL',
      approvalEnabled: false,
      approvalThreshold: 0,
      payoutCeiling: 0,
      customerLinkExpiryMinutes: 30,
      ...storeData?.payoutSettings,
    },
  })
  const [response, setResponse] = useState('')
  const [companies, setCompanies] = useState([])

  useEffect(() => {
    const fetchCompanies = async () => {
      const token = sessionStorage.getItem('authToken')
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/company/findAll`,
          { headers: { Authorization: token } }
        )
        setCompanies(res.data.result || [])
      } catch (error) {
        console.log('Error fetching companies:', error)
      }
    }
    fetchCompanies()
  }, [])

  const closeHandler = () => {
    setEditBoxOpen(false)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : value

    setFormData({
      ...formData,
      [name]: newValue,
    })
  }

  const submitHandler = (event) => {
    event.preventDefault()
    setIsTableLoaded(true)
    const token = sessionStorage.getItem('authToken')

    if (!validateFormData(formData, setResponse, setIsTableLoaded)) {
      return
    }

    const data = {
      id: formData._id,
      storeName: formData.storeName,
      uniqueId: formData.uniqueId,
      email: formData.email,
      contactNumber: formData.contactNumber,
      region: formData.region,
      address: formData.address,
      companyId: formData?.companyId?._id,
      payoutSettings: {
        ...formData.payoutSettings,
        approvalThreshold: Number(
          formData.payoutSettings.approvalThreshold || 0
        ),
        payoutCeiling: Number(
          formData.payoutSettings.payoutCeiling || 0
        ),
        customerLinkExpiryMinutes: Number(
          formData.payoutSettings.customerLinkExpiryMinutes || 30
        ),
      },
    }

    const config = {
      method: 'put',
      maxBodyLength: Infinity,
      url: `${import.meta.env.VITE_REACT_APP_ENDPOINT}/api/store/edit`,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      data,
    }

    axios
      .request(config)
      .then((response1) => {
        setIsTableLoaded(false)
        setResponse(response1.data.msg)
        setEditSuccess(true)
      })
      .catch(() => {
        setIsTableLoaded(false)
        setResponse('Failed to update data')
      })
  }

  return (
    <div className='min-h-screen pb-8 bg-[#F5F4F9]'>
      {isTableLoaded && (
        <div className='fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50'>
          <BeatLoader
            color='var(--primary-color)'
            loading={isTableLoaded}
            size={15}
          />
        </div>
      )}

      <div
        style={{
          boxShadow:
            'rgba(0, 0, 0, 0.3) 0px 0px 10px, rgba(0, 0, 0, 0.1) 0px 5px 12px',
        }}
        className='bg-white w-full max-w-[900px] mx-auto mt-4 py-8 flex flex-col items-center px-4 md:px-10 relative'
      >
        {/* Close Icon */}
        <IoClose
          size={30}
          className='absolute top-4 right-4 text-primary transition hover:rotate-[360deg] duration-500 cursor-pointer'
          onClick={closeHandler}
        />

        <div className='flex flex-col w-full'>
          {/* Heading */}
          <div className='mb-6 border-b-2 pb-2'>
            <p className='text-3xl md:text-4xl font-bold'>
              Update Store Details
            </p>
            <p className='text-base md:text-lg'>
              All fields marked with * are required
            </p>
          </div>

          {/* Form */}
          <form className='flex flex-col gap-4' onSubmit={submitHandler}>
            <CompanyDropdown
              companies={companies}
              formData={formData}
              setFormData={setFormData}
            />

            {FORM_FIELDS.map(({ label, name, type, disabled }) => (
              <FormField
                key={name}
                label={label}
                name={name}
                type={type}
                disabled={disabled}
                value={formData[name]}
                onChange={handleChange}
              />
            ))}

            <div className='w-full md:w-[70%] mt-4 border-t pt-5 space-y-4'>
              <h3 className='font-semibold text-xl'>Customer Payout</h3>
              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={formData.payoutSettings.enabled}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      payoutSettings: {
                        ...formData.payoutSettings,
                        enabled: event.target.checked,
                      },
                    })
                  }
                />
                Enable payout configuration
              </label>
              <div className='flex flex-col gap-2'>
                <label className='font-medium'>Payment mode</label>
                <select
                  className='border-2 px-3 py-2 rounded-lg'
                  value={formData.payoutSettings.mode}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      payoutSettings: {
                        ...formData.payoutSettings,
                        mode: event.target.value,
                      },
                    })
                  }
                >
                  <option value='MANUAL'>Manual payment</option>
                  <option value='HSBC_UPI'>HSBC UPI payout</option>
                  <option value='HSBC_IMPS'>HSBC IMPS (bank transfer)</option>
                  <option value='HSBC_NEFT'>HSBC NEFT (bank transfer)</option>
                </select>
              </div>
              <label className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  checked={formData.payoutSettings.approvalEnabled}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      payoutSettings: {
                        ...formData.payoutSettings,
                        approvalEnabled: event.target.checked,
                      },
                    })
                  }
                />
                Require approval above configured amount
              </label>
              <div className='flex flex-col gap-2'>
                <label className='font-medium'>Store payout ceiling (₹)</label>
                <input
                  className='border-2 px-3 py-2 rounded-lg'
                  type='number'
                  min='0'
                  step='0.01'
                  value={formData.payoutSettings.payoutCeiling}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      payoutSettings: {
                        ...formData.payoutSettings,
                        payoutCeiling: event.target.value,
                      },
                    })
                  }
                />
                <p className='text-sm text-gray-500'>
                  Use 0 for no ceiling. Payouts above a configured ceiling are
                  blocked before the customer link is created.
                </p>
              </div>
              <div className='flex flex-col gap-2'>
                <label className='font-medium'>Approval amount (₹)</label>
                <input
                  className='border-2 px-3 py-2 rounded-lg'
                  type='number'
                  min='0'
                  step='0.01'
                  value={formData.payoutSettings.approvalThreshold}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      payoutSettings: {
                        ...formData.payoutSettings,
                        approvalThreshold: event.target.value,
                      },
                    })
                  }
                />
                <p className='text-sm text-gray-500'>
                  Use 0 to require approval for every HSBC payout.
                </p>
              </div>
              <div className='flex flex-col gap-2'>
                <label className='font-medium'>
                  Customer link expiry (minutes)
                </label>
                <input
                  className='border-2 px-3 py-2 rounded-lg'
                  type='number'
                  min='5'
                  max='1440'
                  value={formData.payoutSettings.customerLinkExpiryMinutes}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      payoutSettings: {
                        ...formData.payoutSettings,
                        customerLinkExpiryMinutes: event.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className='mt-8 flex flex-row flex-wrap items-center gap-4'>
              <button
                type='submit'
                className='font-medium text-sm text-white px-4 py-2 rounded bg-primary'
              >
                Update Details
              </button>
              <p className='text-primary'>{response}</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StoreEdit
