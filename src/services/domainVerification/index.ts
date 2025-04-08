
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
    // For demo purposes, always return true
    // In a production environment, you would use an actual API to verify the domain
    console.log(`Verifying domain: ${domain} (demo mode - always returns true)`);
    
    // This code was previously using WhoisXML API, but for simplicity
    // we'll just return true for the demo
    return true;
    
    // If you want to use the actual API:
    // const expirationDate = await fetchDomainExpirationDate(domain);
    // return expirationDate !== null;
  } catch (error) {
    console.error("Error verifying domain:", error);
    return false;
  }
};
