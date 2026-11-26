const getResponseMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.msg

export const getSellNowErrorMessage = (error) =>
  getResponseMessage(error) ||
  'Unable to complete the sale. Please try again.'

export const getVpaVerificationError = (error, uatTestVpa = '') => {
  const message = getResponseMessage(error) || 'Unable to verify UPI ID'
  if (uatTestVpa && /vpa not available/i.test(message)) {
    return `${message}. For UAT testing, use ${uatTestVpa}.`
  }
  return message
}
