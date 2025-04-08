
import { Domain, VerificationMethod } from "@/types";

// Generate a random verification code for domain verification
export const generateVerificationCode = (): string => {
  return `verify-${Math.random().toString(36).substring(2, 10)}`;
};

// Simulating a verification timeout for testing purposes
export const simulateVerificationTimeout = async (timeout: number = 5000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

// Get verification instructions based on domain and method
export const getVerificationInstructions = (domain: Domain, method: VerificationMethod): string => {
  const code = domain.verificationCode || generateVerificationCode();
  
  switch (method) {
    case VerificationMethod.DNS_TXT:
      return `To verify ownership of ${domain.name}, please add the following TXT record to your domain's DNS settings:

Name: @ or ${domain.name}
Type: TXT
Value: ${code}

After adding, click "Start Verification" below. DNS changes can take up to 24 hours to propagate, but often work within minutes.`;

    case VerificationMethod.DNS_CNAME:
      return `To verify ownership of ${domain.name}, please add the following CNAME record to your domain's DNS settings:

Name: verify
Type: CNAME
Value: verification.domainmarket.com

After adding, click "Start Verification" below. DNS changes can take up to 24 hours to propagate, but often work within minutes.`;

    case VerificationMethod.WHOIS_EMAIL:
      return `We'll send a verification code to the email address listed in your domain's WHOIS record. 

Please ensure you have access to this email, then click "Start Verification" below to receive the code.

Note: If your WHOIS information is private or protected, you may need to use a different verification method.`;

    default:
      return `Please select a verification method to see specific instructions.`;
  }
};
