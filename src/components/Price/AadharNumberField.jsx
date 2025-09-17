import React, { useState } from 'react'
import { AADHAR_LENGTH } from '../../constants/priceConstants'

const AadharNumberField = ({ aadharNumber, setAadharNumber }) => {
  const [error, setError] = useState(true)
  const pink = 'bg-primary'

  const validateAadharNumber = (value) => {
    if (value.length !== AADHAR_LENGTH) {
      setError('Aadhar Number number must be exactly 12 digits.')
      return false
    } else if (!/^\d{12}$/.test(value)) {
      setError('Aadhar Number must only contain digits.')
      return false
    }
    setError('')
    return true
  }

  const handleChange = (e) => {
    const value = e.target.value
    setAadharNumber(value)
    validateAadharNumber(value)
  }

  const handleVerify = () => {
    if (validateAadharNumber(aadharNumber)) {
      // Handle the verify logic here
      console.log('Aadhar Number is valid.')
    }
  }

  return (
    <div className='flex flex-col eminumber mt-[4px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>2.</p>
        <p className='text-base font-medium three'>
          Enter your Aadhar Number
          <span className='text-red-500'>*</span>
        </p>
      </div>

      <div className='flex items-center gap-4 mt-2 ml-[19px]'>
        <input
          type='text'
          className='w-auto p-2 border-2 border-gray-300 rounded'
          value={aadharNumber}
          placeholder='Aadhar no.'
          onChange={handleChange}
          maxLength={12}
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

export default AadharNumberField
