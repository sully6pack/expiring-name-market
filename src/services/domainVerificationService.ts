
import { Domain, VerificationMethod, VerificationStatus } from "@/types";
import { isAdmin } from "./authService";
import { sendEmail, sendVerificationSuccessEmail, sendVerificationFailureEmail } from "./emailService";
import { updateDomain } from "./domainService";
import { useToast } from "@/hooks/use-toast";

// Generate a random verification code for DNS or email verification
export const generateVerificationCode = (): string => {
  return `verify-${Math.random().toString(36).substring(2, 10)}`;
};

// Fetch domain expiration date
export const fetchDomainExpirationDate = async (domainName: string): Promise<Date | null> => {
  console.log(`[VERIFICATION] Fetching expiration date for ${domainName}`);
  
  // In production, this would call a WHOIS API or DNS service
  // For demo purposes, we'll simulate an API response with a random date
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a random expiration date between 1 and 12 months from now
      const today = new Date();
      const monthsToAdd = Math.floor(Math.random() * 12) + 1;
      const expirationDate = new Date(today);
      expirationDate.setMonth(today.getMonth() + monthsToAdd);
      
      console.log(`[VERIFICATION] Fetched expiration date: ${expirationDate.toISOString()}`);
      resolve(expirationDate);
    }, 1500);
  });
};

// Check DNS TXT record verification
export const checkDnsTxtVerification = async (domain: Domain): Promise<boolean> => {
  if (!domain.verificationCode) {
    console.error("No verification code found for domain");
    return false;
  }

  // In production, this would make a DNS lookup request to check for TXT records
  // For our demo, we'll simulate API success with a 30% chance of failure
  console.log(`[VERIFICATION] Checking DNS TXT record for ${domain.name}`);
  
  // Simulate an API call with timeout
  return new Promise(async (resolve) => {
    setTimeout(async () => {
      const isSuccessful = Math.random() > 0.3; // 70% success rate for demo
      
      console.log(`[VERIFICATION] DNS verification ${isSuccessful ? 'passed' : 'failed'} for ${domain.name}`);
      
      if (isSuccessful) {
        // Fetch domain expiration date
        const expirationDate = await fetchDomainExpirationDate(domain.name);
        
        const updatedDomain: Domain = {
          ...domain,
          verificationStatus: VerificationStatus.VERIFIED,
          verificationDate: new Date(),
          isVerified: true,
          // Update expiration date if we found one
          ...(expirationDate && { expirationDate })
        };
        
        const updated = updateDomain(updatedDomain);
        if (updated) {
          // Send success email in a real application
          sendVerificationSuccessEmail(domain.sellerId, domain.name);
        }
      } else {
        const updatedDomain: Domain = {
          ...domain,
          verificationStatus: VerificationStatus.FAILED,
          verificationDate: new Date(),
          verificationNotes: "DNS TXT record verification failed. Please ensure you've added the TXT record correctly."
        };
        
        const updated = updateDomain(updatedDomain);
        if (updated) {
          // Send failure email in a real application
          sendVerificationFailureEmail(domain.sellerId, domain.name, "DNS TXT record verification failed");
        }
      }
      
      resolve(isSuccessful);
    }, 2000); // Simulating a 2-second verification process
  });
};

// Verify domain via WHOIS email
export const startEmailVerification = async (domain: Domain, ownerEmail: string): Promise<boolean> => {
  if (!domain || !ownerEmail) {
    return false;
  }
  
  const verificationCode = generateVerificationCode();
  
  // Update domain with verification info
  const updatedDomain: Domain = {
    ...domain,
    verificationMethod: VerificationMethod.WHOIS_EMAIL,
    verificationCode,
    verificationStatus: VerificationStatus.PENDING
  };
  
  updateDomain(updatedDomain);
  
  // Send verification email
  return sendEmail("DOMAIN_VERIFICATION", {
    to: ownerEmail,
    subject: `Verify your ownership of ${domain.name}`,
    templateData: {
      domainName: domain.name,
      verificationCode,
      verificationUrl: `https://example.com/verify-domain/${domain.id}?code=${verificationCode}`
    }
  });
};

// Verify domain via verification code (email flow)
export const verifyDomainWithCode = async (domainId: string, code: string): Promise<boolean> => {
  try {
    // Get domain from our service
    const domains = window.globalDomains || [];
    const domain = domains.find(d => d.id === domainId);
    
    if (!domain) {
      console.error(`Domain not found with ID: ${domainId}`);
      return false;
    }
    
    if (domain.verificationCode !== code) {
      console.error("Verification code doesn't match");
      return false;
    }
    
    // Fetch domain expiration date
    const expirationDate = await fetchDomainExpirationDate(domain.name);
    
    // Update domain verification status
    const updatedDomain: Domain = {
      ...domain,
      verificationStatus: VerificationStatus.VERIFIED,
      verificationDate: new Date(),
      isVerified: true,
      // Update expiration date if we found one
      ...(expirationDate && { expirationDate })
    };
    
    return updateDomain(updatedDomain);
  } catch (error) {
    console.error("Error verifying domain with code:", error);
    return false;
  }
};

// Admin manual verification
export const adminVerifyDomain = async (domainId: string, notes?: string): Promise<boolean> => {
  if (!isAdmin()) {
    console.error("Only admins can manually verify domains");
    return false;
  }
  
  try {
    const domains = window.globalDomains || [];
    const domain = domains.find(d => d.id === domainId);
    
    if (!domain) {
      console.error(`Domain not found with ID: ${domainId}`);
      return false;
    }
    
    // Fetch domain expiration date
    const expirationDate = await fetchDomainExpirationDate(domain.name);
    
    // Update domain verification status
    const updatedDomain: Domain = {
      ...domain,
      verificationStatus: VerificationStatus.VERIFIED,
      verificationMethod: VerificationMethod.ADMIN_MANUAL,
      verificationDate: new Date(),
      isVerified: true,
      verificationNotes: notes || "Manually verified by admin",
      // Update expiration date if we found one
      ...(expirationDate && { expirationDate })
    };
    
    return updateDomain(updatedDomain);
  } catch (error) {
    console.error("Error during admin verification:", error);
    return false;
  }
};

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
      return `We've sent a verification email to the email address listed in the WHOIS information for ${domain.name}. 
        Please check your email and click the verification link.`;
        
    default:
      return `Please contact support for assistance with domain verification.`;
  }
};

// New helper function to handle the timeout for verification
export const simulateVerificationTimeout = (domainId: string, timeoutMs: number = 30000): void => {
  setTimeout(() => {
    const domains = window.globalDomains || [];
    const domain = domains.find(d => d.id === domainId);
    
    if (domain && domain.verificationStatus === VerificationStatus.PENDING) {
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
