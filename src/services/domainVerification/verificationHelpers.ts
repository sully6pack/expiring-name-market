
import { Domain, VerificationMethod } from "@/types";

// Get verification instructions based on the domain and method
export const getVerificationInstructions = (domain: Domain, method: VerificationMethod): string => {
  const verificationCode = domain.verificationCode || "VERIFICATION_CODE";
  
  switch (method) {
    case VerificationMethod.DNS_TXT:
      return `1. Log in to your domain registrar account (e.g., GoDaddy, Namecheap).
      
2. Navigate to the DNS management section for ${domain.name}.

3. Add a new TXT record with these values:
   - Host/Name: @ (or leave blank, depending on your registrar)
   - Value/Content: ${verificationCode}
   - TTL: 3600 (or 1 hour, if available)

4. Save the changes.

5. Click "Start Verification" below to verify your domain ownership.

NOTE: DNS changes may take up to 24-48 hours to fully propagate, but we'll check immediately and continue trying for verification.`;

    case VerificationMethod.DNS_CNAME:
      return `1. Log in to your domain registrar account (e.g., GoDaddy, Namecheap).
      
2. Navigate to the DNS management section for ${domain.name}.

3. Add a new CNAME record with these values:
   - Host/Name: verify (this will create verify.${domain.name})
   - Value/Points to: ${verificationCode}.verify.domainsell.io
   - TTL: 3600 (or 1 hour, if available)

4. Save the changes.

5. Click "Start Verification" below to verify your domain ownership.

NOTE: DNS changes may take up to 24-48 hours to fully propagate, but we'll check immediately.`;

    case VerificationMethod.WHOIS_EMAIL:
      return `1. We'll send a verification email to the address listed in your domain's WHOIS records.
      
2. If your WHOIS information is private or protected, you may need to either:
   - Temporarily disable WHOIS privacy protection, or
   - Forward the verification email from your privacy service email to your actual email

3. Check your email (including spam folder) for a message from domainsell.io with a verification link or code.

4. Click the verification link in the email or enter the code on this page to verify ownership.

5. Click "Start Verification" below to initiate the email verification process.`;

    default:
      return "Please select a verification method to see instructions.";
  }
};

// Simulate a verification timeout for testing purposes
export const simulateVerificationTimeout = async (domainId: string): Promise<void> => {
  // This function is for development/testing only
  console.log(`[DEV] Simulating verification timeout for domain ${domainId}`);
  return new Promise(resolve => setTimeout(resolve, 15000));
};
