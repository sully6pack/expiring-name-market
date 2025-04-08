
import { Domain } from "@/types";

export const filterValidDomains = (domains: Domain[]): Domain[] => {
  return domains.filter(domain => 
    domain.name && 
    domain.expirationDate instanceof Date && 
    !isNaN(domain.expirationDate.getTime())
  );
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getDaysUntilExpiration = (expirationDate: Date): string => {
  const today = new Date();
  const timeDiff = expirationDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysDiff < 0) {
    return "Expired";
  } else if (daysDiff === 0) {
    return "Expires today";
  } else if (daysDiff === 1) {
    return "Expires tomorrow";
  } else if (daysDiff <= 30) {
    return `Expires in ${daysDiff} days`;
  } else {
    return `Expires in ${Math.floor(daysDiff / 30)} months`;
  }
};

// Function to check if a domain expiration date is valid
export const isDomainValid = (expirationDate: Date): boolean => {
  const today = new Date();
  const timeDiff = expirationDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  // Domain must be expiring within the next 90 days and not more than 15 days past expiration
  return daysDiff <= 90 && daysDiff >= -15;
};

// Function to validate domain name format
export const isValidDomainName = (domain: string): boolean => {
  const pattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return pattern.test(domain);
};
