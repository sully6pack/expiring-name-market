
import { Domain } from "@/types";

export const getUniqueTLDs = (domains: Domain[]): string[] => {
  const tlds = domains.map(domain => domain.tld);
  return [...new Set(tlds)];
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};
