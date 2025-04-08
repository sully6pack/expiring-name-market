
// Export domain verification related functions
export { fetchDomainExpirationDate, getWhoisEmail } from './verificationUtils';

// Export verification helpers
export { 
  generateVerificationCode,
  getVerificationInstructions,
  simulateVerificationTimeout 
} from './verificationHelpers';

// Export domain verification functions
export { verifyDomainWithCode } from './emailVerification';
export { checkDnsTxtVerification } from './dnsVerification';
export { startEmailVerification } from './emailVerification';

// Simple function to check domain verification
export const verifyDomain = async (domain: string): Promise<boolean> => {
  try {
    // Using the WhoisXML API to check if domain exists
    const expirationDate = await fetchDomainExpirationDate(domain);
    return expirationDate !== null;
  } catch (error) {
    console.error("Error verifying domain:", error);
    return false;
  }
};
