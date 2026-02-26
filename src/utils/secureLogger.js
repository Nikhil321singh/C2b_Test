/**
 * Secure Logger - PII-Safe Logging Utility
 *
 * DPDP Compliance: Prevents PII leakage in console logs
 *
 * Features:
 * - Automatically masks PII patterns in logs
 * - Disables console logs in production
 * - Sanitizes objects and arrays recursively
 * - Maintains log formatting for development
 *
 * Usage:
 *   import logger from './utils/secureLogger';
 *   logger.log('User data:', userData); // PII will be masked
 *   logger.error('Error:', err); // PII will be masked
 */

import {
  maskAadhaar,
  maskPhone,
  maskEmail,
  maskIMEI,
  maskPAN,
  maskGST,
  containsPII
} from './piiMasking';

class SecureLogger {
  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;

    // Store original console methods
    this._originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    };
  }

  /**
   * Sanitizes a single value by masking PII patterns
   * @param {any} data - Data to sanitize
   * @returns {any} Sanitized data
   */
  sanitize(data) {
    // Handle null/undefined
    if (data === null || data === undefined) {
      return data;
    }

    // Handle strings - check for PII patterns
    if (typeof data === 'string') {
      // Check for Aadhaar (12 digits)
      if (/^\d{12}$/.test(data.replace(/[\s-]/g, ''))) {
        return maskAadhaar(data);
      }

      // Check for phone (10 digits or +91 format)
      if (/^(\+91)?[\s-]?\d{10}$/.test(data.replace(/[\s-()]/g, ''))) {
        return maskPhone(data);
      }

      // Check for email
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data)) {
        return maskEmail(data);
      }

      // Check for IMEI (15 digits)
      if (/^\d{15}$/.test(data.replace(/[\s-]/g, ''))) {
        return maskIMEI(data);
      }

      // Check for PAN (5 letters, 4 digits, 1 letter)
      if (/^[A-Z]{5}\d{4}[A-Z]$/i.test(data.replace(/\s/g, ''))) {
        return maskPAN(data);
      }

      // Check for GST (15 characters)
      if (/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i.test(data.replace(/\s/g, ''))) {
        return maskGST(data);
      }

      // For strings containing PII in sentences, use containsPII
      if (containsPII(data)) {
        return '[CONTAINS PII - MASKED]';
      }

      return data;
    }

    // Handle numbers - check if it could be PII
    if (typeof data === 'number') {
      const str = String(data);

      // Check for Aadhaar (12 digits)
      if (str.length === 12) {
        return maskAadhaar(str);
      }

      // Check for phone (10 digits)
      if (str.length === 10) {
        return maskPhone(str);
      }

      // Check for IMEI (15 digits)
      if (str.length === 15) {
        return maskIMEI(str);
      }

      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const sanitized = {};

      for (const [key, value] of Object.entries(data)) {
        // Check if key name suggests PII
        const keyLower = key.toLowerCase();
        const piiKeys = [
          'aadhaar', 'aadhar', 'phone', 'mobile', 'email',
          'imei', 'pan', 'gst', 'password', 'token', 'secret'
        ];

        // If key suggests PII, mask the value more aggressively
        if (piiKeys.some(piiKey => keyLower.includes(piiKey))) {
          sanitized[key] = '[MASKED]';
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }

      return sanitized;
    }

    // Return other types as-is (boolean, function, etc.)
    return data;
  }

  /**
   * Safe log method - masks PII before logging
   */
  log(...args) {
    if (this.isProduction) return; // Disable in production

    const sanitized = args.map(arg => this.sanitize(arg));
    this._originalConsole.log(...sanitized);
  }

  /**
   * Safe warn method - masks PII before logging
   */
  warn(...args) {
    if (this.isProduction) return; // Disable in production

    const sanitized = args.map(arg => this.sanitize(arg));
    this._originalConsole.warn(...sanitized);
  }

  /**
   * Safe error method - masks PII before logging
   * Note: Errors are still logged in production but with PII masked
   */
  error(...args) {
    const sanitized = args.map(arg => this.sanitize(arg));
    this._originalConsole.error(...sanitized);
  }

  /**
   * Safe info method - masks PII before logging
   */
  info(...args) {
    if (this.isProduction) return; // Disable in production

    const sanitized = args.map(arg => this.sanitize(arg));
    this._originalConsole.info(...sanitized);
  }

  /**
   * Safe debug method - masks PII before logging
   */
  debug(...args) {
    if (this.isProduction) return; // Disable in production

    const sanitized = args.map(arg => this.sanitize(arg));
    this._originalConsole.debug(...sanitized);
  }

  /**
   * Replaces global console methods with secure versions
   * Call this once in main.jsx to secure all console.log calls
   */
  replaceGlobalConsole() {
    if (this.isProduction) {
      // In production, completely disable console except errors
      console.log = () => {};
      console.warn = () => {};
      console.info = () => {};
      console.debug = () => {};
      console.error = (...args) => this.error(...args);
    } else {
      // In development, replace with sanitizing versions
      console.log = (...args) => this.log(...args);
      console.warn = (...args) => this.warn(...args);
      console.error = (...args) => this.error(...args);
      console.info = (...args) => this.info(...args);
      console.debug = (...args) => this.debug(...args);
    }
  }

  /**
   * Restores original console methods
   * Useful for debugging if needed
   */
  restoreGlobalConsole() {
    console.log = this._originalConsole.log;
    console.warn = this._originalConsole.warn;
    console.error = this._originalConsole.error;
    console.info = this._originalConsole.info;
    console.debug = this._originalConsole.debug;
  }
}

// Export singleton instance
const logger = new SecureLogger();
export default logger;
