
import { DomainCategory, VerificationStatus, VerificationMethod } from "@/types";

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

// Helper function to validate and convert verification method string to VerificationMethod enum
export const validateVerificationMethod = (method?: string): VerificationMethod | undefined => {
  if (!method) return undefined;
  
  if (Object.values(VerificationMethod).includes(method as VerificationMethod)) {
    return method as VerificationMethod;
  }
  return undefined;
};
