
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
export const verifyDomain = async (domain: string): Promise<{isValid: boolean, reason?: string, source?: string} | null> => {
  try {
    // For demo purposes, we'll do a simple validation first
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.error(`Invalid domain format: ${domain}`);
      return {
        isValid: false,
        reason: "invalid_format"
      };
    }
    
    console.log(`Verifying domain: ${domain}`);
    
    // Call the actual verification function with more verbose logging
    console.log(`Initiating Supabase function call for domain: ${domain}`);
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'verifyDomain',
        domain: domain
      }
    });
    
    console.log(`Supabase function response:`, data, error);
    
    if (error) {
      console.error("Error verifying domain:", error);
      return {
        isValid: false,
        reason: "api_error",
        source: "function_error"
      };
    }
    
    if (!data.success) {
      console.error("Error verifying domain:", data.error);
      return {
        isValid: false,
        reason: data.reason || "verification_failed",
        source: data.source
      };
    }
    
    // Return the full response including reason and source if available
    return {
      isValid: data.isValid,
      reason: data.reason,
      source: data.source
    };
  } catch (error) {
    console.error("Error verifying domain:", error);
    return {
      isValid: false,
      reason: "unexpected_error",
      source: "client"
    };
  }
};
