
import { Domain, VerificationStatus, VerificationMethod } from "@/types";
import { supabase } from "@/lib/supabase";
import { updateDomainVerificationStatus } from "@/services/supaDomainService";

// Verify domain using DNS TXT record
export const checkDnsTxtVerification = async (domain: Domain): Promise<boolean> => {
  if (!domain.verificationCode) {
    console.error("Missing verification code for DNS TXT check");
    await updateDomainVerificationStatus(
      domain.id, 
      VerificationStatus.FAILED,
      VerificationMethod.DNS_TXT,
      "Missing verification code"
    );
    return false;
  }

  try {
    console.log(`Checking DNS TXT verification for domain: ${domain.name} with code: ${domain.verificationCode}`);
    
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'checkDnsTxtRecord',
        domain: domain.name,
        verificationCode: domain.verificationCode
      }
    });
    
    if (error) {
      console.error("Error invoking DNS TXT check:", error);
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.DNS_TXT,
        "Error checking DNS TXT record: " + error.message
      );
      return false;
    }
    
    if (!data || !data.success) {
      console.error("DNS TXT check returned error:", data?.error || "No data returned");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.DNS_TXT,
        "DNS TXT check failed: " + (data?.error || "Unknown error")
      );
      return false;
    }
    
    const isVerified = data.isVerified === true;
    
    if (isVerified) {
      console.log("DNS TXT verification successful");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.VERIFIED,
        VerificationMethod.DNS_TXT
      );
      return true;
    } else {
      console.log("DNS TXT verification failed, TXT record not found or incorrect");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        VerificationMethod.DNS_TXT,
        "TXT record not found or does not match expected value"
      );
      return false;
    }
  } catch (error) {
    console.error("Exception during DNS TXT verification:", error);
    await updateDomainVerificationStatus(
      domain.id, 
      VerificationStatus.FAILED,
      VerificationMethod.DNS_TXT,
      "Exception during verification: " + (error instanceof Error ? error.message : String(error))
    );
    return false;
  }
};
