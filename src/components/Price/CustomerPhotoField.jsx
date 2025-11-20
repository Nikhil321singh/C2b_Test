import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { FaCamera } from 'react-icons/fa'
import { getStatusIcon } from '../../utils/priceUtils.jsx'
import { FILE_KEYS } from '../../constants/priceConstants'
import toast from 'react-hot-toast'

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
}

const dataURLtoFile = (dataurl, filename) => {
  if (!dataurl) {
    return null
  }

  const arr = dataurl.split(',')
  if (arr.length < 2) {
    return null
  }

  const mimeMatch = arr[0].match(/:(.*?);/)
  if (!mimeMatch) {
    return null
  }

  const mime = mimeMatch[1]
  const bstr = atob(arr[1])
  const u8arr = new Uint8Array(bstr.length)

  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i)
  }

  return new File([u8arr], filename, { type: mime })
}

// --- FIX 1: duplicated code removed by helper ---
const resetFileInput = (fileInputRef) => {
  if (fileInputRef?.current) {
    fileInputRef.current.value = null
  }
}

const validateIMEI = (imeinumber, fileInputRef) => {
  if (!imeinumber) {
    toast.error('Please enter IMEI number first')
    resetFileInput(fileInputRef)
    return false
  }
  return true
}

const PhotoContainer = ({ children }) => (
  <div className='p-1 mt-4 text-center border-2 justify-between rounded-lg h-[15vh] w-[100vw] md:w-[40vw] relative border-primary shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
    <p className='font-semibold text-center'>Customer Photo</p>
    {children}
  </div>
)

const CustomerPhotoField = ({
  customerPhoto,
  setCustomerPhoto,
  uploadStatus,
  uploadIndividualFile,
  imeinumber,
  prod,
  fileInputRef,
  handleCameraButtonClick,
}) => {
  const [showWebcam, setShowWebcam] = useState(false)
  const webcamRef = useRef(null)
  const photoStatus = uploadStatus[FILE_KEYS.CUSTOMER_PHOTO]?.status

  const capture = useCallback(() => {
    if (!validateIMEI(imeinumber, fileInputRef)) {
      return
    }

    const imageSrc = webcamRef.current?.getScreenshot()
    if (!imageSrc) {
      toast.error('Could not capture photo. Please try again.')
      return
    }

    const fileName = 'customerPhoto'
    const file = dataURLtoFile(imageSrc, `${imeinumber}-${fileName}.jpg`)

    if (file) {
      setCustomerPhoto(file)
      setShowWebcam(false)
      uploadIndividualFile(file, fileName, file.type, FILE_KEYS.CUSTOMER_PHOTO)
    }
  }, [imeinumber, uploadIndividualFile, setCustomerPhoto])

  const onFileSelect = (e) => {
    if (!validateIMEI(imeinumber, fileInputRef)) {
      return
    }

    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should not exceed 2MB')
        resetFileInput(fileInputRef)
        return
      }

      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Please upload a JPG or PNG image')
        resetFileInput(fileInputRef)
        return
      }

      setCustomerPhoto(file)
      uploadIndividualFile(
        file,
        'customerPhoto',
        file.type,
        FILE_KEYS.CUSTOMER_PHOTO
      )
    }
  }

  const clearPhoto = () => {
    setCustomerPhoto(null)
    setShowWebcam(false)
    resetFileInput(fileInputRef)
  }

  const sectionNumber = (prod?.[0]?.phoneBillSno || 6) + 1

  const renderWebcamCapture = () =>
    showWebcam && (
      <div className='w-[100vw] md:w-[40vw] gap-2'>
        <div className='p-1 border-2 border-primary rounded-lg shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]'>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat='image/jpeg'
            videoConstraints={videoConstraints}
            mirrored
          />
        </div>

        <div className='flex gap-4 mt-2'>
          <button
            type='button'
            className='px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg'
            onClick={() => setShowWebcam(false)}
          >
            Cancel
          </button>

          <button
            type='button'
            className='px-4 py-2 font-bold text-white rounded-lg bg-primary'
            onClick={capture}
          >
            Take Snapshot
          </button>
        </div>
      </div>
    )

  const renderPhotoPreview = () =>
    !showWebcam &&
    customerPhoto && (
      <PhotoContainer>
        <div className='relative'>
          <img
            className='w-full h-[60px] object-contain'
            src={URL.createObjectURL(customerPhoto)}
            alt='Customer Photo'
          />
          <div className='absolute top-1 right-1'>
            {getStatusIcon(photoStatus)}
          </div>
        </div>

        <button
          type='button'
          className='px-2 py-0 mt-1 text-sm text-gray-700 bg-gray-200 rounded-lg'
          onClick={clearPhoto}
        >
          Retake / Re-upload
        </button>
      </PhotoContainer>
    )

  const renderUploadOptions = () =>
    !showWebcam &&
    !customerPhoto && (
      <PhotoContainer>
        <div className='flex items-center justify-center gap-4 h-[60px]'>
          <button
            type='button'
            title='Capture with webcam'
            className='flex flex-col items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100'
            onClick={() => setShowWebcam(true)}
          >
            <FaCamera className='text-3xl' />
            <span className='text-xs'>Capture</span>
          </button>

          <button
            type='button'
            title='Upload from device'
            className='flex flex-col items-center p-2 text-gray-600 rounded-lg hover:bg-gray-100'
            onClick={() => handleCameraButtonClick(fileInputRef)}
          >
            <FaCamera className='text-3xl' />
            <span className='text-xs'>Upload</span>
          </button>
        </div>
      </PhotoContainer>
    )

  return (
    <div className='flex flex-col adharcard mt-[10px]'>
      <div className='flex gap-1 two'>
        <p className='text-base font-medium'>{sectionNumber}.</p>
        <div className='flex items-center'>
          <p className='text-base font-medium three'>
            Upload Your Photo (Mandatory)
            <span className='text-red-500'>*</span>
          </p>
        </div>
      </div>

      <p className='mt-2 text-sm text-primary ml-[19px]'>
        Note: Image size should not exceed 2MB
      </p>

      <div className='flex justify-start ml-3 inputAADHAR'>
        <input
          type='file'
          accept='image/png, image/jpeg'
          onChange={onFileSelect}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />

        {renderWebcamCapture()}
        {renderPhotoPreview()}
        {renderUploadOptions()}
      </div>
    </div>
  )
}

export default CustomerPhotoField
