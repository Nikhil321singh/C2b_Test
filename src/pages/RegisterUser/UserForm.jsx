import React, { useState, useRef, useEffect } from 'react'
import { IoEye, IoEyeOffSharp } from 'react-icons/io5'
import { FaAngleDown } from 'react-icons/fa6'
import { USER_ROLES } from '../../constants/roleConstants'

const role = import.meta.env.VITE_REACT_APP_ROLES
  ? import.meta.env.VITE_REACT_APP_ROLES.split(',').map((item) => item.trim())
  : defaultRoles

const UserForm = ({
  formData,
  submitHandler,
  handleChange,
  storeData,
  isSuperAdmin,
  isCompanyAdmin,
  isAdminManager,
  errMsg,
  isValid,
  setPasswordFocus,
  companies = [],
  stores = [],
  setFormData,
}) => {
  const [showUserPassword, setShowUserPassword] = useState(false)
  const [showStoreDropdown, setShowStoreDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowStoreDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStoreToggle = (storeId) => {
    const currentStores = formData.assignedStores || []
    const updatedStores = currentStores.includes(storeId)
      ? currentStores.filter((id) => id !== storeId)
      : [...currentStores, storeId]
    setFormData({ ...formData, assignedStores: updatedStores })
  }

  const getSelectedStoresDisplay = () => {
    const selectedCount = (formData.assignedStores || []).length
    if (selectedCount === 0) return 'Select Stores'
    if (selectedCount === 1) {
      const store = stores.find((s) => s._id === formData.assignedStores[0])
      return store ? `${store.storeName} - ${store.region}` : 'Select Stores'
    }
    return `${selectedCount} stores selected`
  }

  // Filter roles based on logged-in user
  const getFilteredRoles = () => {
    if (isSuperAdmin) {
      // Super Admin can see all roles except Technician
      return role.filter(r => r !== USER_ROLES.TECHNICIAN)
    } else if (isCompanyAdmin) {
      // Company Admin can only see: Admin Manager, Technician, Sale User
      return role.filter(r =>
        r === USER_ROLES.ADMIN_MANAGER ||
        r === USER_ROLES.TECHNICIAN ||
        r === USER_ROLES.SALE_USER
      )
    } else if (isAdminManager) {
      // Admin Manager can only see: Technician, Sale User
      return role.filter(r =>
        r === USER_ROLES.TECHNICIAN ||
        r === USER_ROLES.SALE_USER
      )
    }
    return []
  }

  const filteredRoles = getFilteredRoles()

  return (
    <form
      className='ml-10 flex flex-col gap-4'
      onSubmit={submitHandler}
      autoComplete='off'
    >
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>First name*</span>
        <input
          name='firstName'
          id='firstName'
          placeholder='Enter first name'
          value={formData.firstName}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg outline-none'
          type='text'
          required
        />
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Last name</span>
        <input
          name='lastName'
          id='lastName'
          placeholder='Enter last name'
          value={formData.lastName}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg outline-none'
          type='text'
        />
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Email*</span>
        <input
          name='email'
          id='email'
          minLength={6}
          placeholder='Enter your email address'
          value={formData.email || ''}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none '
          type='email'
          autoComplete='off'
          required
        />
      </label>
      <div>
        <label className='font-medium text-xl' htmlFor='password'>
          Password*
        </label>
        <div className='flex flex-col relative input w-[70%] gap-2'>
          <input
            name='password'
            id='password'
            minLength={8}
            maxLength={20}
            placeholder='Enter new password (min. 8 characters)'
            value={formData.password || ''}
            onChange={handleChange}
            onFocus={() => setPasswordFocus(true)}
            onBlur={() => setPasswordFocus(false)}
            className='border-2 px-2 py-2 rounded-lg  outline-none '
            type={showUserPassword ? 'text' : 'password'}
            autoComplete='off'
            required
          />
          <span
            onClick={() => setShowUserPassword(!showUserPassword)}
            className='absolute transform -translate-y-1/2 cursor-pointer right-2 top-6'
          >
            {!showUserPassword ? <IoEyeOffSharp /> : <IoEye />}
          </span>
        </div>
        {formData.password && (
          <p
            className={`${
              isValid ? 'text-primary' : 'text-red-600'
            } text-sm mt-1`}
          >
            {errMsg}
          </p>
        )}
      </div>
      <label className='flex flex-col w-[70%] gap-2 '>
        <span className='font-medium text-xl'>Mobile Number*</span>
        <input
          name='phoneNumber'
          id='phoneNumber'
          minLength={10}
          placeholder='Enter 10-digit mobile number'
          value={formData.phoneNumber}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none'
          maxLength={10}
          type='tel'
          required
        />
      </label>
      {isSuperAdmin && (
        <label className='flex flex-col w-[70%] gap-2'>
          <span className='font-medium text-xl'>Company*</span>
          <select
            id='companyId'
            name='companyId'
            value={formData.companyId}
            className='outline-none text-base border-2 px-2 py-2 rounded-lg'
            onChange={handleChange}
            required
          >
            <option value=''>Select Company</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.name} ({company.companyCode})
              </option>
            ))}
          </select>
        </label>
      )}
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Role*</span>
        <select
          id='role'
          name='role'
          value={formData.role}
          className='outline-none text-base border-2 px-2 py-2 rounded-lg'
          onChange={handleChange}
          required
        >
          <option value=''>None</option>
          {filteredRoles.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {(isSuperAdmin || isCompanyAdmin || isAdminManager) &&
        (formData.role === USER_ROLES.ADMIN_MANAGER ||
          formData.role === USER_ROLES.TECHNICIAN) && (
          <div className='flex flex-col w-[70%] gap-2' ref={dropdownRef}>
            <span className='font-medium text-xl'>Store Name*</span>
            <div className='relative'>
              <div
                onClick={() => setShowStoreDropdown(!showStoreDropdown)}
                className='outline-none text-base border-2 p-2 rounded-lg cursor-pointer flex justify-between items-center bg-white'
              >
                <span className='truncate'>{getSelectedStoresDisplay()}</span>
                <FaAngleDown
                  className={`transition-transform ${
                    showStoreDropdown ? 'rotate-180' : ''
                  }`}
                  size={17}
                />
              </div>
              {showStoreDropdown && (
                <div className='absolute z-10 w-full mt-1 bg-white border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto'>
                  {stores.length === 0 ? (
                    <div className='p-3 text-gray-500'>
                      {formData.companyId
                        ? 'No stores available for this company'
                        : 'Please select a company first'}
                    </div>
                  ) : (
                    stores.map((store) => (
                      <div
                        key={store._id}
                        onClick={() => handleStoreToggle(store._id)}
                        className='p-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2'
                      >
                        <input
                          type='checkbox'
                          checked={(formData.assignedStores || []).includes(
                            store._id
                          )}
                          onChange={() => {}}
                          className='w-4 h-4 cursor-pointer'
                        />
                        <span className='text-base'>
                          {store.storeName} - {store.region}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {(formData.assignedStores || []).length === 0 && (
              <input
                type='text'
                className='hidden'
                required
                value={(formData.assignedStores || []).length > 0 ? 'valid' : ''}
              />
            )}
          </div>
        )}
      {(isSuperAdmin || isCompanyAdmin || isAdminManager) &&
        formData.role &&
        formData.role !== USER_ROLES.ADMIN_MANAGER &&
        formData.role !== USER_ROLES.TECHNICIAN &&
        formData.role !== USER_ROLES.SUPER_ADMIN &&
        formData.role !== USER_ROLES.COMPANY_ADMIN && (
          <label className='flex flex-col w-[70%] gap-2'>
            <span className='font-medium text-xl'>Store Name*</span>
            <select
              name='storeId'
              id='storeId'
              value={formData.storeId}
              className='outline-none text-base border-2 p-2 rounded-lg'
              onChange={handleChange}
              required
            >
              <option value=''>Select Store</option>
              {stores.length === 0 ? (
                <option value='' disabled>
                  {formData.companyId
                    ? 'No stores available for this company'
                    : 'Please select a company first'}
                </option>
              ) : (
                stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.storeName} - {store.region}
                  </option>
                ))
              )}
            </select>
          </label>
        )}

      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>City</span>
        <input
          name='city'
          id='city'
          placeholder='Enter your city name'
          value={formData.city}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none'
          type='text'
        />
      </label>
      <label className='flex flex-col w-[70%] gap-2'>
        <span className='font-medium text-xl'>Adddress</span>
        <input
          name='address'
          id='address'
          placeholder='Enter your full address'
          value={formData.address}
          onChange={handleChange}
          className='border-2 px-2 py-2 rounded-lg  outline-none'
          type='text'
        />
      </label>
      <div className='mt-8'>
        <button
          type='submit'
          className='font-medium text-sm text-white p-3 rounded bg-primary'
        >
          Submit Form
        </button>
      </div>
    </form>
  )
}

export default UserForm
