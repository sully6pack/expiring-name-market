
import { Domain, VerificationStatus } from "@/types";
import { updateDomain } from "../domainService";
import { getWhoisEmail } from "./verificationUtils";
import { sendVerificationEmail } from "../emailService";
import { supabase } from "@/lib/supabase";

// Start email verification process
export const startEmailVerification = async (domain: Domain, userEmail: string): Promise<boolean> => {
  console.log(`[VERIFICATION] Starting email verification for ${domain.name}`);
  
  if (!domain.verificationCode) {
    console.error("No verification code found for domain");
    return false;
  }
  
  try {
    // Get the domain's WHOIS email
    const whoisEmail = await getWhoisEmail(domain.name);
    console.log(`[VERIFICATION] WHOIS email for ${domain.name}: ${whoisEmail || 'Not found'}`);
    
    // If no WHOIS email is found, use the user's email
    const targetEmail = whoisEmail || userEmail;
    
    if (!targetEmail) {
      console.error("No email address available for verification");
      return false;
    }
    
    // Send the verification email
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'sendVerificationEmail',
        domain: domain.name,
        email: targetEmail,
        verificationCode: domain.verificationCode
      }
    });
    
    if (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
    
    if (!data.success) {
      console.error('Failed to send verification email:', data.error);
      return false;
    }
    
    console.log(`[VERIFICATION] Verification email sent to ${targetEmail}`);
    
    // Update domain status to pending
    const updatedDomain: Domain = {
      ...domain,
      verificationStatus: VerificationStatus.PENDING,
      verificationNotes: `Verification email sent to ${targetEmail}. Please check your email and click the verification link.`
    };
    
    await updateDomain(updatedDomain);
    
    return true;
  } catch (error) {
    console.error("Error in startEmailVerification:", error);
    
    // Update domain status to failed
    const updatedDomain: Domain = {
      ...domain,
      verificationStatus: VerificationStatus.FAILED,
      verificationDate: new Date(),
      verificationNotes: "Failed to send verification email. Please try again."
    };
    
    await updateDomain(updatedDomain);
    
    return false;
  }
};

// Verify domain with code from email
export const verifyDomainWithCode = async (domainId: string, code: string): Promise<boolean> => {
  console.log(`[VERIFICATION] Verifying domain ${domainId} with code ${code}`);
  
  try {
    // Get the domain from the database
    const { data: domainData, error: domainError } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();
    
    if (domainError || !domainData) {
      console.error("Error fetching domain:", domainError);
      return false;
    }
    
    // Check if the verification code matches
    if (domainData.verification_code !== code) {
      console.error("Verification code doesn't match");
      
      // Update domain status to failed
      await supabase
        .from('domains')
        .update({
          verification_status: VerificationStatus.FAILED,
          verification_date: new Date().toISOString(),
          verification_notes: "Invalid verification code."
        })
        .eq('id', domainId);
      
      return false;
    }
    
    // Verification successful, update domain
    await supabase
      .from('domains')
      .update({
        verification_status: VerificationStatus.VERIFIED,
        verification_date: new Date().toISOString(),
        is_verified: true
      })
      .eq('id', domainId);
    
    console.log(`[VERIFICATION] Domain ${domainId} verified successfully`);
    return true;
  } catch (error) {
    console.error("Error in verifyDomainWithCode:", error);
    return false;
  }
};
