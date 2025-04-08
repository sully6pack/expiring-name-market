
import { Domain, VerificationStatus } from "@/types";
import { supabase } from "@/lib/supabase";
import { updateDomainVerificationStatus } from "@/services/supaDomainService";

// Verify domain using DNS TXT record
export const checkDnsTxtVerification = async (domain: Domain): Promise<boolean> => {
  if (!domain.verificationCode) {
    console.error("Missing verification code for DNS TXT check");
    return false;
  }

  try {
    console.log(`Checking DNS TXT verification for domain: ${domain.name}`);
    
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
        undefined,
        "Error checking DNS TXT record: " + error.message
      );
      return false;
    }
    
    if (!data.success) {
      console.error("DNS TXT check returned error:", data.error);
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        undefined,
        "DNS TXT check failed: " + (data.error || "Unknown error")
      );
      return false;
    }
    
    const isVerified = data.isVerified === true;
    
    if (isVerified) {
      console.log("DNS TXT verification successful");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.VERIFIED
      );
      return true;
    } else {
      console.log("DNS TXT verification failed, TXT record not found or incorrect");
      await updateDomainVerificationStatus(
        domain.id, 
        VerificationStatus.FAILED,
        undefined,
        "TXT record not found or does not match expected value"
      );
      return false;
    }
  } catch (error) {
    console.error("Exception during DNS TXT verification:", error);
    await updateDomainVerificationStatus(
      domain.id, 
      VerificationStatus.FAILED,
      undefined,
      "Exception during verification: " + (error instanceof Error ? error.message : String(error))
    );
    return false;
  }
};
