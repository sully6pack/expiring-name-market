
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
    // Basic validation for domain format first
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    if (!domainRegex.test(domain)) {
      console.error(`Invalid domain format: ${domain}`);
      return {
        isValid: false,
        reason: "invalid_format"
      };
    }
    
    console.log(`Verifying domain: ${domain}`);
    
    // For real verification, we'll perform a DNS lookup to check if the domain exists
    try {
      const dnsResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
      const dnsData = await dnsResponse.json();
      
      if (!dnsResponse.ok) {
        console.error(`DNS API error: ${dnsResponse.status} ${dnsResponse.statusText}`);
        // Continue to Supabase function as fallback
      } else {
        // If we get a valid response with answers or authority records, the domain likely exists
        if ((dnsData.Answer && dnsData.Answer.length > 0) || 
            (dnsData.Authority && dnsData.Authority.length > 0)) {
          console.log(`DNS lookup confirmed domain ${domain} exists via Google DNS API`);
          return {
            isValid: true,
            source: "dns_lookup"
          };
        }
        
        // If NXDOMAIN response, the domain doesn't exist
        if (dnsData.Status === 3) { // NXDOMAIN
          console.log(`DNS lookup shows domain ${domain} does not exist (NXDOMAIN)`);
          return {
            isValid: false,
            reason: "domain_not_found",
            source: "dns_lookup"
          };
        }
      }
    } catch (dnsError) {
      console.warn(`Error during DNS lookup for ${domain}:`, dnsError);
      // Continue with Supabase function as fallback
    }
    
    // Call the Supabase function for further verification
    console.log(`Initiating Supabase function call for domain: ${domain}`);
    
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'verifyDomain',
        domain: domain
      }
    });
    
    // Handle function invocation error
    if (error) {
      console.error("Supabase function invocation error:", error);
      
      // If the function call fails, fallback to a simple domain format check
      const tld = domain.split('.').pop()?.toLowerCase() || '';
      const domainName = domain.split('.').slice(-2, -1)[0];
      
      if (domainName && domainName.length >= 3 && ['com', 'org', 'net', 'io', 'co', 'app'].includes(tld)) {
        console.log(`Supabase function failed but domain format looks valid: ${domain}`);
        return {
          isValid: true,
          reason: "supabase_function_error_but_domain_looks_valid",
          source: "format_check"
        };
      }
      
      return {
        isValid: false,
        reason: "api_error",
        source: "function_error"
      };
    }
    
    // If we have data but no success field, something went wrong with the function
    if (!data || (typeof data.success !== 'boolean')) {
      console.error("Invalid response from Supabase function:", data);
      return {
        isValid: false,
        reason: "invalid_api_response",
        source: "function_error"
      };
    }
    
    // If the function returned but wasn't successful
    if (!data.success) {
      console.error("Error from Supabase function:", data.error);
      return {
        isValid: false,
        reason: data.reason || "verification_failed",
        source: data.source || "function_error"
      };
    }
    
    // Function call succeeded
    return {
      isValid: data.isValid || false,
      reason: data.reason,
      source: data.source
    };
  } catch (error) {
    console.error("Unexpected error verifying domain:", error);
    return {
      isValid: false,
      reason: "unexpected_error",
      source: "client"
    };
  }
};
