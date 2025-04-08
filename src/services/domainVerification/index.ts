
// Import domain verification utility functions
import { fetchDomainExpirationDate, getWhoisEmail } from './verificationUtils';

// Import verification helpers
import { 
  generateVerificationCode,
  getVerificationInstructions,
  simulateVerificationTimeout 
} from './verificationHelpers';

// Import verification methods
import { checkDnsTxtVerification } from './dnsVerification';
import { verifyDomainWithCode, startEmailVerification } from './emailVerification';

// Export all verification functions and utilities
export { 
  // Verification utilities
  fetchDomainExpirationDate, 
  getWhoisEmail,
  
  // Verification helpers
  generateVerificationCode,
  getVerificationInstructions,
  simulateVerificationTimeout,
  
  // DNS verification
  checkDnsTxtVerification,
  
  // Email verification
  startEmailVerification,
  verifyDomainWithCode 
};

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
