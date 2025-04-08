
import { Domain, VerificationStatus, VerificationMethod } from "@/types";
import { isAdmin } from "../authService";
import { updateDomain } from "../domainService";
import { fetchDomainExpirationDate } from "./verificationUtils";

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
