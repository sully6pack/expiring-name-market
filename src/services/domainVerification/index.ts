
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

// Import Supabase client
import { supabase } from "@/lib/supabase";

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

// Function to check domain verification
export const verifyDomain = async (domain: string): Promise<boolean> => {
  try {
    // For demo purposes, we'll do a simple validation first
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.error(`Invalid domain format: ${domain}`);
      return false;
    }
    
    console.log(`Verifying domain: ${domain}`);
    
    // Call the actual verification function
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'verifyDomain',
        domain: domain
      }
    });
    
    if (error) {
      console.error("Error verifying domain:", error);
      return false;
    }
    
    if (!data.success) {
      console.error("Error verifying domain:", data.error);
      return false;
    }
    
    return data.isValid;
  } catch (error) {
    console.error("Error verifying domain:", error);
    return false;
  }
};
