import React, { useState } from 'react'
import { IMEI_LENGTH } from '../../constants/priceConstants'

const ImeiField = ({ imeinumber, setImeiNumber, prod }) => {
  const [error, setError] = useState(true)
  const pink = 'bg-primary'

  const validateImeiNumber = (value) => {
    if (value.length !== IMEI_LENGTH) {
      setError('IMEI number must less than or equal to 15 digits.')
      return false
    } else if (!/^\d{15}$/.test(value)) {
      setError('IMEI number must only contain digits.')
      return false
    }
    setError('')
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value
    setImeiNumber(value)
    validateImeiNumber(value)
  }

  const handleVerify = () => {
    if (validateImeiNumber(imeinumber)) {
      // Handle the verify logic here
      console.log('IMEI number is valid.')
    }
  }

  return (
    <div className='flex flex-col eminumber mt-[4px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>1.</p>
        <p className='text-base font-medium three'>
          Enter your {prod[0]?.categoryName} IMEI No./serial no.
          <span className='text-red-500'>*</span>
        </p>
      </div>

      <div className='flex items-center gap-4 mt-2 ml-[19px]'>
        <input
          type='text'
          className='w-auto p-2 border-2 border-gray-300 rounded'
          value={imeinumber}
          placeholder='IMEI no./Serial no.'
          onChange={handleChange}
          maxLength={15}
        />
        <button
          className={`px-4 py-2 font-bold text-white rounded ${
            !error ? pink : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleVerify}
          disabled={!!error}
        >
          Verify
        </button>
      </div>
      {error && <p className='text-primary mt-2 text-sm'>{error}</p>}
    </div>
  )
}

export default ImeiField
