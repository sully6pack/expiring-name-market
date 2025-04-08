
// Export domain verification related functions from a single entry point
export * from './dnsVerification';
export * from './emailVerification';
export * from './adminVerification';

// Export from verificationHelpers with explicit naming
export {
  getVerificationInstructions,
  generateVerificationCode,
  simulateVerificationTimeout
} from './verificationHelpers';

// Export from verificationUtils with renamed functions to avoid conflicts
export {
  fetchDomainExpirationDate,
  getWhoisEmail,
  generateVerificationCode as generateVerificationToken
} from './verificationUtils';
