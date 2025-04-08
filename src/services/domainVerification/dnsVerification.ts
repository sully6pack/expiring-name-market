
import { Domain, VerificationStatus } from "@/types";
import { updateDomain } from "../domainService";
import { sendVerificationSuccessEmail, sendVerificationFailureEmail } from "../emailService";
import { supabase } from "@/lib/supabase";
import { fetchDomainExpirationDate } from "./verificationUtils";

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
