
import { Domain, VerificationMethod, VerificationStatus } from "@/types";
import { isAdmin } from "./authService";
import { sendEmail, sendVerificationSuccessEmail, sendVerificationFailureEmail } from "./emailService";
import { updateDomain } from "./domainService";
import { supabase } from "@/lib/supabase";

// Generate a random verification code for DNS or email verification
export const generateVerificationCode = (): string => {
  return `verify-${Math.random().toString(36).substring(2, 10)}`;
};

// Fetch domain expiration date using WhoisXML API
export const fetchDomainExpirationDate = async (domainName: string): Promise<Date | null> => {
  console.log(`[VERIFICATION] Fetching expiration date for ${domainName}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'getExpirationDate',
        domain: domainName
      }
    });

    if (error) {
      console.error('Error invoking domain-verification function:', error);
      return null;
    }

    if (!data.success) {
      console.error('Error fetching expiration date:', data.error);
      return null;
    }

    if (data.expirationDate) {
      console.log(`[VERIFICATION] Fetched expiration date: ${data.expirationDate}`);
      return new Date(data.expirationDate);
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchDomainExpirationDate:', error);
    return null;
  }
};

// Check DNS TXT record verification using Google DNS API
export const checkDnsTxtVerification = async (domain: Domain): Promise<boolean> => {
  if (!domain.verificationCode) {
    console.error("No verification code found for domain");
    return false;
  }

  console.log(`[VERIFICATION] Checking DNS TXT record for ${domain.name}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'checkDnsTxtRecord',
        domain: domain.name,
        verificationCode: domain.verificationCode
      }
    });

    if (error) {
      console.error('Error invoking domain-verification function:', error);
      
      const updatedDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.FAILED,
        verificationDate: new Date(),
        verificationNotes: "Error checking DNS TXT record. Please try again later."
      };
      
      updateDomain(updatedDomain);
      sendVerificationFailureEmail(domain.sellerId, domain.name, "Error checking DNS TXT record");
      return false;
    }

    if (!data.success) {
      console.error('Error checking DNS TXT record:', data.error);
      
      const updatedDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.FAILED,
        verificationDate: new Date(),
        verificationNotes: "Error checking DNS TXT record. Please try again later."
      };
      
      updateDomain(updatedDomain);
      sendVerificationFailureEmail(domain.sellerId, domain.name, "Error checking DNS TXT record");
      return false;
    }

    const isVerified = data.isVerified;
    console.log(`[VERIFICATION] DNS verification ${isVerified ? 'passed' : 'failed'} for ${domain.name}`);
    
    if (isVerified) {
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
        sendVerificationSuccessEmail(domain.sellerId, domain.name);
      }
      return true;
    } else {
      const updatedDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.FAILED,
        verificationDate: new Date(),
        verificationNotes: "DNS TXT record verification failed. Please ensure you've added the TXT record correctly."
      };
      
      const updated = updateDomain(updatedDomain);
      if (updated) {
        sendVerificationFailureEmail(domain.sellerId, domain.name, "DNS TXT record verification failed");
      }
      return false;
    }
  } catch (error) {
    console.error('Error in checkDnsTxtVerification:', error);
    
    const updatedDomain: Domain = {
      ...domain,
      verificationStatus: VerificationStatus.FAILED,
      verificationDate: new Date(),
      verificationNotes: "Error checking DNS TXT record. Please try again later."
    };
    
    updateDomain(updatedDomain);
    return false;
  }
};

// Get WHOIS email for domain verification
export const getWhoisEmail = async (domain: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'getWhoisEmail',
        domain
      }
    });

    if (error) {
      console.error('Error invoking domain-verification function:', error);
      return null;
    }

    if (!data.success) {
      console.error('Error fetching WHOIS email:', data.error);
      return null;
    }

    return data.email;
  } catch (error) {
    console.error('Error in getWhoisEmail:', error);
    return null;
  }
};

// Verify domain via WHOIS email
export const startEmailVerification = async (domain: Domain, ownerEmail?: string): Promise<boolean> => {
  if (!domain) {
    return false;
  }
  
  // If no owner email is provided, try to fetch it from WHOIS
  if (!ownerEmail) {
    ownerEmail = await getWhoisEmail(domain.name);
    
    if (!ownerEmail) {
      console.error(`[VERIFICATION] Could not find WHOIS email for ${domain.name}`);
      
      const updatedDomain: Domain = {
        ...domain,
        verificationStatus: VerificationStatus.FAILED,
        verificationDate: new Date(),
        verificationNotes: "Could not find WHOIS email for this domain. Please try another verification method."
      };
      
      updateDomain(updatedDomain);
      return false;
    }
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
  
  try {
    // Send verification email via the edge function
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'sendVerificationEmail',
        domain: domain.name,
        email: ownerEmail,
        verificationCode
      }
    });

    if (error) {
      console.error('Error invoking email verification function:', error);
      return false;
    }

    if (!data.success) {
      console.error('Error sending verification email:', data.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Verify domain via verification code (email flow)
export const verifyDomainWithCode = async (domainId: string, code: string): Promise<boolean> => {
  try {
    console.log(`Verifying domain ID: ${domainId} with code: ${code}`);
    
    // Get domain from Supabase
    const { data: domain, error } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();
    
    if (error || !domain) {
      console.error(`Domain not found with ID: ${domainId}`, error);
      return false;
    }
    
    console.log(`Domain found: ${domain.name}, verification code: ${domain.verification_code}, input code: ${code}`);
    
    if (domain.verification_code !== code) {
      console.error("Verification code doesn't match");
      return false;
    }
    
    // Fetch domain expiration date
    let expirationDate = null;
    try {
      expirationDate = await fetchDomainExpirationDate(domain.name);
      console.log(`Fetched expiration date for ${domain.name}:`, expirationDate);
    } catch (expError) {
      console.error(`Error fetching expiration date: ${expError}`);
      // Continue with verification even if we fail to get expiration date
    }
    
    // Update domain verification status
    const updateData = {
      verification_status: VerificationStatus.VERIFIED,
      verification_date: new Date().toISOString(),
      is_verified: true,
      ...(expirationDate && { expiration_date: expirationDate.toISOString() })
    };
    
    console.log(`Domain verified, updating status:`, updateData);
    
    const { error: updateError } = await supabase
      .from('domains')
      .update(updateData)
      .eq('id', domainId);
    
    if (updateError) {
      console.error("Error updating domain verification status:", updateError);
      return false;
    }
    
    // Update global domains list if it exists
    if (window.globalDomains) {
      try {
        const domainIndex = window.globalDomains.findIndex(d => d.id === domainId);
        if (domainIndex >= 0) {
          const updatedDomain = {
            ...window.globalDomains[domainIndex],
            verificationStatus: VerificationStatus.VERIFIED,
            verificationDate: new Date(),
            isVerified: true,
            ...(expirationDate && { expirationDate })
          };
          
          window.globalDomains[domainIndex] = updatedDomain;
          
          try {
            localStorage.setItem('globalDomains', JSON.stringify(window.globalDomains));
            console.log(`Domain verification status updated in localStorage for ${domain.name}`);
          } catch (error) {
            console.error('Error saving domains to localStorage:', error);
          }
        }
      } catch (err) {
        console.error('Error updating globalDomains:', err);
        // Continue with verification even if updating globalDomains fails
      }
    }
    
    return true;
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
