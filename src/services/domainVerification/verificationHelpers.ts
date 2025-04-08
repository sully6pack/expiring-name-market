
import { Domain, VerificationMethod } from "@/types";

// Generate a verification code for domain verification
export const generateVerificationCode = (): string => {
  return `verify-${Math.random().toString(36).substring(2, 10)}`;
};

// Simulate verification timeout (for demo purposes)
export const simulateVerificationTimeout = async (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 10000));
};

// Get verification instructions based on domain and method
export const getVerificationInstructions = (domain: Domain, method: VerificationMethod): string => {
  const verificationCode = domain.verificationCode || generateVerificationCode();

  if (method === VerificationMethod.DNS_TXT) {
    return `1. Log in to your domain registrar account.
2. Navigate to the DNS management section.
3. Add a new TXT record with the following values:
   - Host/Name: @ or leave blank (root domain)
   - Value/Data: ${verificationCode}
   - TTL: Default or 3600
4. Save the changes.
5. Click "Start Verification" below.

Note: DNS changes can take up to 48 hours to propagate, but usually take effect within 15 minutes.`;
  } else if (method === VerificationMethod.DNS_CNAME) {
    return `1. Log in to your domain registrar account.
2. Navigate to the DNS management section.
3. Add a new CNAME record with the following values:
   - Host/Name: verify
   - Value/Target: ${verificationCode}.verify.domainmarket.com
   - TTL: Default or 3600
4. Save the changes.
5. Click "Start Verification" below.

Note: DNS changes can take up to 48 hours to propagate, but usually take effect within 15 minutes.`;
  } else if (method === VerificationMethod.WHOIS_EMAIL) {
    return `We will send a verification email to the address listed in your domain's WHOIS information. 

1. Make sure your WHOIS information is up to date.
2. Check that email account for a verification message from us.
3. Click the verification link in the email to confirm ownership.

Note: If your WHOIS privacy protection is enabled, please temporarily disable it or choose another verification method.`;
  } else {
    return "Please select a verification method to see instructions.";
  }
};
