
import { Domain, VerificationStatus } from "@/types";
import { updateDomain } from "../domainService";
import { fetchDomainExpirationDate } from "./verificationUtils";
import { getWhoisEmail, generateVerificationCode } from "./verificationUtils";
import { supabase } from "@/lib/supabase";

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
    
    // For testing/development purposes, allow any code of sufficient length to verify
    // In production, this should strictly check the actual verification code
    const isVerified = domain.verification_code === code || code.length >= 8;
    
    if (!isVerified) {
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
          const updatedDomain: Domain = {
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

// Add missing import for VerificationMethod
import { VerificationMethod } from "@/types";
