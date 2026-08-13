import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getSellNowErrorMessage,
  getVpaVerificationError,
} from '../src/utils/payoutErrorMessages.js'

test('Sell Now surfaces backend payout eligibility messages', () => {
  const error = {
    response: {
      data: {
        message: 'Device cooldown validation failed',
      },
    },
  }

  assert.equal(
    getSellNowErrorMessage(error),
    'Device cooldown validation failed',
  )
})

test('Sell Now falls back safely when the backend has no message', () => {
  assert.equal(
    getSellNowErrorMessage(new Error('network failure')),
    'Unable to complete the sale. Please try again.',
  )
})

test('VPA rejection includes the configured UAT test VPA only in UAT', () => {
  const error = {
    response: { data: { message: 'VPA not available' } },
  }

  assert.equal(
    getVpaVerificationError(error, '7776968905@hsbc'),
    'VPA not available. For UAT testing, use 7776968905@hsbc.',
  )
  assert.equal(getVpaVerificationError(error), 'VPA not available')
})
