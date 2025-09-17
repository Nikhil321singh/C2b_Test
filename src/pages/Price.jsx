import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CgSpinner } from 'react-icons/cg'
import toast from 'react-hot-toast'

// Import components
import PriceHeader from '../components/Price/PriceHeader'
import ImeiField from '../components/Price/ImeiField'
import AadharNumberField from '../components/Price/AadharNumberField'
import AdharField from '../components/Price/AdharField'
import PhoneBill from '../components/Price/PhoneBill'
import PhonePhotos1 from '../components/Price/PhonePhotos1'

// Import hooks and utilities
import { useFileUpload } from '../hooks/useFileUpload'
import { validateFormData, getRequiredFiles, getFailedUploads } from '../utils/validationUtils'
import { submitFormData } from '../utils/formSubmissionUtils'
import { retryFailedUploads } from '../utils/retryUtils'

const pink = 'bg-primary'

const Price = () => {
  const leadsubmitDATA = JSON.parse(sessionStorage.getItem('responsedatadata'))
  const savedOtpData = JSON.parse(localStorage.getItem('otpData'))
  const token = sessionStorage.getItem('authToken')
  const [file, setFile] = useState(null)
  const [idProofBack, setIdProofBack] = useState(null)
  const [phoneBill, setPhoneBill] = useState(null)
  const [phoneFront, setPhoneFront] = useState(null)
  const [phoneBack, setPhoneBack] = useState(null)
  const [phoneLeft, setPhoneLeft] = useState(null)
  const [phoneRight, setPhoneRight] = useState(null)
  const [phoneTop, setPhoneTop] = useState(null)
  const [phoneBottom, setPhoneBottom] = useState(null)
  const [aadharNumber, setAadharNumber] = useState('')
  const [imeinumber, setImeiNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const idproofBackRef = useRef(null)
  const phoneBillRef = useRef(null)
  const phoneFrontRef = useRef(null)
  const phoneBackRef = useRef(null)
  const phoneLeftRef = useRef(null)
  const phoneRightRef = useRef(null)
  const phoneTopRef = useRef(null)
  const phoneBottomRef = useRef(null)
  const [isBillRequired, setIsBillRequired] = useState(false)
  const Device = sessionStorage.getItem('DeviceType')
  const categories = JSON.parse(sessionStorage.getItem('Categories'))
  const prod = categories.filter((elem) => elem.categoryCode === Device)
  
  // Use custom hook for file upload logic
  const { uploadStatus, uploadIndividualFile, handleFileChange } = useFileUpload(token, imeinumber)
  
  useEffect(() => {
    const billData = JSON.parse(sessionStorage.getItem('billData'))
    if (billData && billData?.selected[0] === false) {
      setIsBillRequired(true)
    }
  }, [])

  const handleCameraButtonClick = (ref) => {
    if (!ref.current) {
      return
    }
    ref.current.click()
  }

  const uploadAllImages = async () => {
    setIsLoading(true)

    // Validate form data
    const formData = {
      aadharNumber,
      imeinumber,
      phoneFront,
      phoneBack,
      phoneLeft,
      phoneRight,
      phoneTop,
      phoneBottom,
      phoneBill,
      isBillRequired
    }

    if (!validateFormData(formData)) {
      setIsLoading(false)
      return
    }

    // Get required files and check upload status
    const requiredFiles = getRequiredFiles(isBillRequired)
    const failedUploads = getFailedUploads(requiredFiles, uploadStatus)

    if (failedUploads.length > 0) {
      // Try to retry failed uploads
      const fileStates = {
        file,
        idProofBack,
        phoneBill,
        phoneFront,
        phoneBack,
        phoneLeft,
        phoneRight,
        phoneTop,
        phoneBottom
      }

      const stillHasFailures = await retryFailedUploads(
        requiredFiles,
        uploadStatus,
        fileStates,
        uploadIndividualFile
      )

      if (stillHasFailures) {
        toast.error(
          `Please ensure all files are uploaded successfully. ${
            failedUploads.length
          } files still pending: ${failedUploads.join(', ')}`
        )
        setIsLoading(false)
        return
      }

      // Check again after retry
      const stillFailed = getFailedUploads(requiredFiles, uploadStatus)

      if (stillFailed.length > 0) {
        toast.error(
          `Still ${
            stillFailed.length
          } files pending after retry: ${stillFailed.join(', ')}`
        )
        setIsLoading(false)
        return
      }
    }

    // Submit form data
    const submissionData = {
      imeinumber,
      leadsubmitDATA,
      savedOtpData,
      aadharNumber
    }

    const success = await submitFormData(submissionData, token, navigate)
    setIsLoading(false)
  }

  return (
    <div className='h-[100vh] max-h-[200vh] overflow-y-auto bg-white '>
      <PriceHeader navigate={navigate} />
      <div className='w-[90%] md:w-[90%] mx-auto h-[auto] mb-[93px]'>
        <div className='mt-3 text-center relative'>
          <h1 className='text-2xl font-semibold'>Upload Documents</h1>
          <p className='mt-4 text-gray-600'>
            Regulations require you to upload a national identity card. Don't
            worry, your data will stay safe and private.
          </p>
        </div>
        <div className='flex flex-col'>
          <ImeiField
            setImeiNumber={setImeiNumber}
            imeinumber={imeinumber}
            prod={prod}
          />
          <AadharNumberField
            setAadharNumber={setAadharNumber}
            aadharNumber={aadharNumber}
            prod={prod}
          />
          <AdharField
            handleChange={handleFileChange}
            setFile={setFile}
            fileInputRef={fileInputRef}
            handleCameraButtonClick={handleCameraButtonClick}
            file={file}
            setIdProofBack={setIdProofBack}
            idProofBack={idProofBack}
            idproofBackRef={idproofBackRef}
            prod={prod}
            uploadStatus={uploadStatus}
          />
          <PhoneBill
            handleChange={handleFileChange}
            setPhoneBill={setPhoneBill}
            phoneBackRef={phoneBackRef}
            handleCameraButtonClick={handleCameraButtonClick}
            phoneBillRef={phoneBillRef}
            phoneBill={phoneBill}
            isBillRequired={isBillRequired}
            prod={prod}
            uploadStatus={uploadStatus}
          />
          <PhonePhotos1
            handleCameraButtonClick={handleCameraButtonClick}
            handleChange={handleFileChange}
            phoneFront={phoneFront}
            setPhoneFront={setPhoneFront}
            phoneFrontRef={phoneFrontRef}
            setPhoneBottom={setPhoneBottom}
            phoneBackRef={phoneBackRef}
            phoneBack={phoneBack}
            phoneBottom={phoneBottom}
            phoneTop={phoneTop}
            phoneBottomRef={phoneBottomRef}
            setPhoneLeft={setPhoneLeft}
            setPhoneBack={setPhoneBack}
            setPhoneTop={setPhoneTop}
            phoneLeft={phoneLeft}
            phoneRight={phoneRight}
            phoneTopRef={phoneTopRef}
            phoneRightRef={phoneRightRef}
            setPhoneRight={setPhoneRight}
            phoneLeftRef={phoneLeftRef}
            prod={prod}
            uploadStatus={uploadStatus}
          />
        </div>
      </div>
      <div className='fixed bottom-0 flex flex-col w-full gap-2 p-4 bg-white border-t-2 '>
        <div
          onClick={() => uploadAllImages()}
          className={` relative text-center py-1 px-2 rounded-lg cursor-pointer flex justify-between text-white items-center ${
            !imeinumber ||
            !phoneFront ||
            !phoneBack ||
            !phoneLeft ||
            !phoneRight ||
            !phoneTop ||
            !phoneBottom
              ? 'cursor-not-allowed bg-gray-400'
              : pink
          }`}
        >
          {isLoading && (
            <CgSpinner
              size={20}
              className='absolute left-[28%] top-[8px] mt-1 animate-spin'
            />
          )}
          <p className='w-full p-1 text-xl font-medium'>
            {isLoading ? 'Submitting' : 'Submit'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Price