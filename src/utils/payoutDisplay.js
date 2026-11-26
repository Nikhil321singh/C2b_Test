const BANK_PROVIDERS = new Set(['HSBC_IMPS', 'HSBC_NEFT'])

export const isBankTransferPayout = (payout) =>
  BANK_PROVIDERS.has(payout?.provider)

export const getPayoutDisplayState = (payout) => {
  if (!payout) {
    return { statusLabel: '', statusMessage: '' }
  }
  if (payout.status !== 'AWAITING_VPA') {
    return {
      statusLabel: String(payout.status || '').replaceAll('_', ' '),
      statusMessage: payout.statusMessage || '',
    }
  }
  if (payout.linkNotificationState !== 'DELIVERED') {
    const failed = payout.linkNotificationState === 'FAILED'
    return {
      statusLabel: failed ? 'LINK DELIVERY FAILED' : 'CUSTOMER LINK NOT SENT',
      statusMessage: failed
        ? 'The customer payment link could not be delivered. Retry sending it.'
        : 'Ready to send the customer payment link.',
    }
  }
  const bankTransfer = isBankTransferPayout(payout)
  return {
    statusLabel: bankTransfer ? 'AWAITING BANK DETAILS' : 'AWAITING UPI ID',
    statusMessage: bankTransfer
      ? 'Payment link sent. Waiting for the customer to provide bank account details.'
      : 'Payment link sent. Waiting for the customer to provide a UPI ID.',
  }
}

export const formatStatusCheckedAt = (value) =>
  value ? new Date(value).toLocaleString('en-IN') : ''
