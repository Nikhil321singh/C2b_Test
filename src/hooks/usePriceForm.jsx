import { useState, useEffect, useRef } from 'react'

export const usePriceForm = () => {
  // Form state
  const [file, setFile] = useState(null)
  const [idProofBack, setIdProofBack] = useState(null)
  const [phoneBill, setPhoneBill] = useState(null)
  const [phoneFront, setPhoneFront] = useState(null)
  const [phoneBack, setPhoneBack] = useState(null)
  const [phoneLeft, setPhoneLeft] = useState(null)
  const [phoneRight, setPhoneRight] = useState(null)
  const [phoneTop, setPhoneTop] = useState(null)
  const [phoneBottom, setPhoneBottom] = useState(null)
  const [signatureFile, setSignatureFile] = useState(null); // <-- Added new signature file state
  const [aadharNumber, setAadharNumber] = useState('')
  const [imeinumber, setImeiNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isBillRequired, setIsBillRequired] = useState(false)

  // Refs
  const fileInputRef = useRef(null)
  const idproofBackRef = useRef(null)
  const phoneBillRef = useRef(null)
  const phoneFrontRef = useRef(null)
  const phoneBackRef = useRef(null)
  const phoneLeftRef = useRef(null)
  const phoneRightRef = useRef(null)
  const phoneTopRef = useRef(null)
  const phoneBottomRef = useRef(null)

  // Get session data
  const leadsubmitDATA = JSON.parse(sessionStorage.getItem('responsedatadata'))
  const savedOtpData = JSON.parse(localStorage.getItem('otpData'))
  const token = sessionStorage.getItem('authToken')
  const Device = sessionStorage.getItem('DeviceType')
  const categories = JSON.parse(sessionStorage.getItem('Categories'))
  const prod = categories.filter((elem) => elem.categoryCode === Device)

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

  return {
    // Form state
    file,
    setFile,
    idProofBack,
    setIdProofBack,
    phoneBill,
    setPhoneBill,
    phoneFront,
    setPhoneFront,
    phoneBack,
    setPhoneBack,
    phoneLeft,
    setPhoneLeft,
    phoneRight,
    setPhoneRight,
    phoneTop,
    setPhoneTop,
    phoneBottom,
    setPhoneBottom,
    signatureFile,     //Added new signatureFile
    setSignatureFile,  //Added new signature state function
    aadharNumber,
    setAadharNumber,
    imeinumber,
    setImeiNumber,
    isLoading,
    setIsLoading,
    isBillRequired,

    // Refs
    fileInputRef,
    idproofBackRef,
    phoneBillRef,
    phoneFrontRef,
    phoneBackRef,
    phoneLeftRef,
    phoneRightRef,
    phoneTopRef,
    phoneBottomRef,

    // Session data
    leadsubmitDATA,
    savedOtpData,
    token,
    prod,

    // Handlers
    handleCameraButtonClick
  }
}
