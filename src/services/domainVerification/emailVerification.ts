
import { Domain, VerificationStatus, VerificationMethod } from "@/types";
import { supabase } from "@/lib/supabase";
import { updateDomainVerificationStatus } from "@/services/supaDomainService";
import { getWhoisEmail } from "./verificationUtils";

// Start email verification process
export const startEmailVerification = async (domain: Domain, userEmail?: string): Promise<boolean> => {
  try {
    console.log(`Starting email verification for domain: ${domain.name}`);
    
    // If no verification code exists, we can't proceed
    if (!domain.verificationCode) {
      console.error("Missing verification code for email verification");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.WHOIS_EMAIL,
        "Missing verification code"
      );
      return false;
    }
    
    // Get the WHOIS email for the domain
    const whoisEmail = await getWhoisEmail(domain.name);
    
    if (!whoisEmail && !userEmail) {
      console.error("No email address found for verification");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.WHOIS_EMAIL,
        "No email address found for verification"
      );
      return false;
    }
    
    const emailToUse = whoisEmail || userEmail;
    
    console.log(`Sending verification email to: ${emailToUse}`);
    
    // In a real implementation, you would send an actual email here
    // For now, we'll simulate success
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Email verification initiated successfully");
    return true;
    
  } catch (error) {
    console.error("Error during email verification:", error);
    await updateDomainVerificationStatus(
      domain.id, 
      VerificationStatus.FAILED,
      VerificationMethod.WHOIS_EMAIL,
      "Error sending verification email: " + (error instanceof Error ? error.message : String(error))
    );
    return false;
  }
};

// Verify domain with verification code
export const verifyDomainWithCode = async (domainId: string, code: string): Promise<boolean> => {
  try {
    console.log(`Verifying domain ${domainId} with code: ${code}`);
    
    // Get the domain from the database to check against the stored code
    const { data: domainData, error } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();
    
    if (error || !domainData) {
      console.error("Error fetching domain for verification:", error);
      return false;
    }
    
    const verificationCode = domainData.verification_code;
    
    if (!verificationCode) {
      console.error("No verification code found for domain");
      await updateDomainVerificationStatus(
        domainId, 
        VerificationStatus.FAILED,
        undefined,
        "No verification code found for this domain"
      );
      return false;
    }
    
    // Check if the code matches
    if (code === verificationCode) {
      console.log("Verification code matched successfully");
      await updateDomainVerificationStatus(
        domainId, 
        VerificationStatus.VERIFIED
      );
      return true;
    } else {
      console.log("Verification code did not match");
      await updateDomainVerificationStatus(
        domainId, 
        VerificationStatus.FAILED,
        undefined,
        "Verification code did not match"
      );
      return false;
    }
    
  } catch (error) {
    console.error("Error during code verification:", error);
    return false;
  }
};
