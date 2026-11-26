import test from 'node:test'
import assert from 'node:assert/strict'
import { getPayoutDisplayState } from '../src/utils/payoutDisplay.js'

test('an unsent payout link is not described as waiting for the customer', () => {
  assert.deepEqual(
    getPayoutDisplayState({
      status: 'AWAITING_VPA',
      provider: 'HSBC_UPI',
      linkNotificationState: 'NOT_SENT',
    }),
    {
      statusLabel: 'CUSTOMER LINK NOT SENT',
      statusMessage: 'Ready to send the customer payment link.',
    },
  )
})

test('delivered bank-transfer links use bank-detail terminology', () => {
  assert.deepEqual(
    getPayoutDisplayState({
      status: 'AWAITING_VPA',
      provider: 'HSBC_NEFT',
      linkNotificationState: 'DELIVERED',
    }),
    {
      statusLabel: 'AWAITING BANK DETAILS',
      statusMessage:
        'Payment link sent. Waiting for the customer to provide bank account details.',
    },
  )
})
