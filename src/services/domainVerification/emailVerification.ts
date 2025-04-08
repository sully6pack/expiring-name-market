
import { Domain, VerificationStatus } from "@/types";
import { updateDomain } from "../domainService";
import { getWhoisEmail } from "./verificationUtils";
import { sendDomainVerificationEmail } from "../emailService";
import { supabase } from "@/lib/supabase";

// Generate a random verification code
const generateVerificationCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Start email verification process
export const startEmailVerification = async (domain: Domain, userEmail: string): Promise<boolean> => {
  console.log(`[VERIFICATION] Starting email verification for ${domain.name}`);
  
  // Ensure domain has a verification code
  const verificationCode = domain.verificationCode || generateVerificationCode();
  
  // Update domain with verification code if it doesn't have one
  if (!domain.verificationCode) {
    console.log(`[VERIFICATION] Generating new verification code for ${domain.name}`);
    const { error } = await supabase
      .from('domains')
      .update({ verification_code: verificationCode })
      .eq('id', domain.id);
    
    if (error) {
      console.error("Error updating domain with verification code:", error);
      return false;
    }
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
    
    // Generate verification URL
    const verificationUrl = `${window.location.origin}/verify-domain/${domain.id}?code=${verificationCode}`;
    
    // Send the verification email
    const emailSent = await sendDomainVerificationEmail(
      targetEmail,
      domain.name,
      verificationCode,
      verificationUrl
    );
    
    if (!emailSent) {
      console.error("Failed to send verification email");
      return false;
    }
    
    console.log(`[VERIFICATION] Verification email sent to ${targetEmail}`);
    
    // Update domain status to pending
    const updatedDomain: Domain = {
      ...domain,
      verificationCode: verificationCode,
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
