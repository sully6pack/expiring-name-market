
import { Domain, VerificationStatus } from "@/types";
import { updateDomain } from "../domainService";
import { getWhoisEmail } from "./verificationUtils";
import { sendDomainVerificationEmail } from "../emailService";
import { supabase } from "@/lib/supabase";
import { generateVerificationCode } from "./verificationHelpers";

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
    // Determine the target email address
    // Try to get email from WHOIS, fallback to user email
    let targetEmail = userEmail;
    
    const whoisEmail = await getWhoisEmail(domain.name);
    if (whoisEmail) {
      targetEmail = whoisEmail;
      console.log(`[VERIFICATION] Using WHOIS email: ${targetEmail}`);
    } else {
      console.log(`[VERIFICATION] No WHOIS email found, using user email: ${targetEmail}`);
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
      console.error(`[VERIFICATION] Failed to send verification email for ${domain.name}`);
      return false;
    }
    
    console.log(`[VERIFICATION] Verification email sent for ${domain.name}`);
    
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
    console.error(`[VERIFICATION] Error during email verification for ${domain.name}:`, error);
    return false;
  }
};

// Verify domain with verification code
export const verifyDomainWithCode = async (domainId: string, code: string): Promise<boolean> => {
  console.log(`[VERIFICATION] Verifying domain ${domainId} with code ${code}`);
  
  try {
    // Get domain from database
    const { data: domainData, error: fetchError } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();
    
    if (fetchError || !domainData) {
      console.error("[VERIFICATION] Error fetching domain:", fetchError);
      return false;
    }
    
    // Check if verification code matches
    if (domainData.verification_code !== code) {
      console.error("[VERIFICATION] Verification code mismatch");
      
      // Update domain status to failed
      await supabase
        .from('domains')
        .update({
          verification_status: VerificationStatus.FAILED,
          verification_date: new Date().toISOString(),
          verification_notes: "Verification failed: Invalid verification code"
        })
        .eq('id', domainId);
      
      return false;
    }
    
    // Update domain status to verified
    const { error: updateError } = await supabase
      .from('domains')
      .update({
        verification_status: VerificationStatus.VERIFIED,
        verification_date: new Date().toISOString(),
        verification_notes: "Domain verified successfully via email verification",
        is_verified: true
      })
      .eq('id', domainId);
    
    if (updateError) {
      console.error("[VERIFICATION] Error updating domain status:", updateError);
      return false;
    }
    
    console.log("[VERIFICATION] Domain verified successfully");
    return true;
  } catch (error) {
    console.error("[VERIFICATION] Error during verification:", error);
    return false;
  }
};
