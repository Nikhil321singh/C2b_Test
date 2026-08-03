const isExplicitlyEnabled = (value) =>
  String(value || '').trim().toLowerCase() === 'true'

// Fail closed: KYC remains mandatory unless this flag is explicitly true.
export const RELAX_KYC_VALIDATION = isExplicitlyEnabled(
  import.meta.env.VITE_RELAX_KYC_VALIDATION
)

// Provider mocks are additionally restricted to Vite development mode so a
// production build cannot enable them accidentally.
export const KYC_TEST_MODE =
  import.meta.env.DEV &&
  isExplicitlyEnabled(import.meta.env.VITE_KYC_TEST_MODE)

export const KYC_TEST_DATA = Object.freeze({
  aadhaarNumber: '111111111111',
  aadhaarOtp: '123456',
  aadhaarClientId: 'GREST-LOCAL-AADHAAR',
  imei: '111111111111111',
})
