# React + Vite

## KYC validation switch

KYC and document requirements fail closed. To make them optional for local
testing only, add this to `.env.local` and restart Vite:

```env
VITE_RELAX_KYC_VALIDATION=true
```

Use `false` (or omit the variable) in UAT and production. Vite reads environment
variables at startup/build time, so changing the value requires restarting the
development server or rebuilding the application.

To exercise the required Aadhaar and IMEI verification screens locally without
calling their external providers:

```env
VITE_RELAX_KYC_VALIDATION=false
VITE_KYC_TEST_MODE=true
```

Run with `npm run dev`, then use:

- Aadhaar: `111111111111`
- OTP: `123456`
- IMEI: `111111111111111`

The provider test mode is code-restricted to Vite development builds. A
production build always uses the real configured verification services.

For HSBC UAT, the customer payout form can be prefilled with the HSBC-provided
test payee VPA:

```env
VITE_HSBC_UAT_TEST_VPA=7776968905@hsbc
```

Leave this variable empty in production.


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
