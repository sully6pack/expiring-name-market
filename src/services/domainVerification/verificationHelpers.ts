
import { Domain, VerificationMethod, VerificationStatus } from "@/types";
import { updateDomain } from "../domainService";
import { generateVerificationCode } from "./verificationUtils";

// Get instructions for domain verification
export const getVerificationInstructions = (domain: Domain, method: VerificationMethod): string => {
  const verificationCode = domain.verificationCode || generateVerificationCode();
  
  switch (method) {
    case VerificationMethod.DNS_TXT:
      return `Add a TXT record to your domain with the following information:
        Host: @ or ${domain.name}
        Value: ${verificationCode}
        TTL: 3600 (or default)`;
        
    case VerificationMethod.DNS_CNAME:
      return `Add a CNAME record to your domain with the following information:
        Host: verify
        Value: verification.example.com
        TTL: 3600 (or default)`;
        
    case VerificationMethod.WHOIS_EMAIL:
      return `We will send a verification email to the email address listed in the WHOIS information for ${domain.name}. 
        Please check your email and click the verification link.`;
        
    default:
      return `Please contact support for assistance with domain verification.`;
  }
};

// Simulate verification timeout
export const simulateVerificationTimeout = (domainId: string, timeoutMs: number = 15000): void => {
  console.log(`[VERIFICATION] Setting timeout for domain ${domainId} for ${timeoutMs}ms`);
  
  setTimeout(() => {
    const domains = window.globalDomains || [];
    const domain = domains.find(d => d.id === domainId);
    
    if (domain && domain.verificationStatus === VerificationStatus.PENDING) {
      console.log(`[VERIFICATION] Timeout reached for domain ${domainId}, marking as failed`);
      
      // If still pending after timeout, mark as failed
      const updatedDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.FAILED,
        verificationDate: new Date(),
        verificationNotes: "Verification timed out. Please try again."
      };
      
      updateDomain(updatedDomain);
    }
  }, timeoutMs);
};
