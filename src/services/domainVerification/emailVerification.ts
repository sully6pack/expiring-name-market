
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
    
    if (!emailToUse) {
      console.error("Could not determine email address for verification");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.WHOIS_EMAIL,
        "Could not determine email address for verification"
      );
      return false;
    }
    
    // Create verification URL with domain ID and code
    const verificationUrl = `${window.location.origin}/verify-domain/${domain.id}?code=${domain.verificationCode}`;
    
    // Call Supabase edge function to send email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: emailToUse,
        subject: `Verify your domain: ${domain.name}`,
        domain: domain.name,
        verificationCode: domain.verificationCode,
        verificationUrl: verificationUrl
      }
    });
    
    if (error || !data || !data.success) {
      console.error("Failed to send verification email:", error || (data?.error || "Unknown error"));
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.WHOIS_EMAIL,
        "Failed to send verification email: " + (error?.message || data?.error || "Unknown error")
      );
      return false;
    }
    
    console.log("Email verification initiated successfully");
    
    // Update domain status to pending
    await updateDomainVerificationStatus(
      domain.id,
      VerificationStatus.PENDING,
      VerificationMethod.WHOIS_EMAIL,
      "Verification email sent. Waiting for verification."
    );
    
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
    
    // Input validation
    if (!domainId || !code || code.trim() === '') {
      console.error("Missing required parameters for verification");
      return false;
    }
    
    // Get the domain from the database to check against the stored code
    const { data: domainData, error } = await supabase
      .from('domains')
      .select('*')
      .eq('id', domainId)
      .single();
    
    if (error) {
      console.error("Error fetching domain for verification:", error);
      return false;
    }
    
    if (!domainData) {
      console.error("Domain not found with ID:", domainId);
      return false;
    }
    
    const verificationCode = domainData.verification_code;
    
    console.log(`Database verification code: ${verificationCode}, Provided code: ${code}`);
    
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
    
    // Check if the code matches - do strict comparison
    if (code === verificationCode) {
      console.log("Verification code matched successfully");
      await updateDomainVerificationStatus(
        domainId, 
        VerificationStatus.VERIFIED,
        undefined,
        "Domain verified successfully via verification code",
        "true" // Use string "true" since the function expects a string
      );
      return true;
    } else {
      console.log(`Verification code did not match. Expected: ${verificationCode}, Got: ${code}`);
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
