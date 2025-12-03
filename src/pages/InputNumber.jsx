import Price from './Price'
import OTPpage from './OTP_page'
import { useSelector } from 'react-redux'

const InputNumber = () => {
  const otpVerification = useSelector((state) => state.otpVerification)
  return <Price />
}

export default InputNumber
