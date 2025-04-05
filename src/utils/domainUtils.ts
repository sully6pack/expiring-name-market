
import { Domain } from "@/types";

export const getUniqueTLDs = (domains: Domain[]): string[] => {
  const tlds = domains.map(domain => domain.tld);
  return [...new Set(tlds)];
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

// Function to extract TLD from a domain name
export const extractTLD = (domainName: string): string | null => {
  // Simple regex to extract TLD (everything after the last dot)
  const match = domainName.match(/\.([^.]+)$/);
  return match ? match[1] : null;
};
