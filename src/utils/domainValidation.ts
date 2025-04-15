
import { DomainCategory, VerificationStatus } from "@/types";

// Helper function to validate and convert category string to DomainCategory enum
export const validateDomainCategory = (category: string): DomainCategory => {
  if (Object.values(DomainCategory).includes(category as DomainCategory)) {
    return category as DomainCategory;
  }
  return DomainCategory.Other; // Default to "Other" if category is not valid
};

// Helper function to validate and convert verification status string to VerificationStatus enum
export const validateVerificationStatus = (status: string): VerificationStatus => {
  if (Object.values(VerificationStatus).includes(status as VerificationStatus)) {
    return status as VerificationStatus;
  }
  return VerificationStatus.NOT_STARTED; // Default if not valid
};
