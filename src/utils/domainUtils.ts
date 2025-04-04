
/**
 * Extracts the Top-Level Domain (TLD) from a domain name
 * @param domainName Full domain name (e.g., example.com, sub.example.co.uk)
 * @returns The TLD string (e.g., com, org, co.uk)
 */
export const extractTLD = (domainName: string): string => {
  // Handle case where domain has no dots
  if (!domainName.includes('.')) {
    return '';
  }
  
  // For simplicity, we'll consider the TLD to be everything after the last dot
  // For more complex cases (like co.uk), a more sophisticated approach would be needed
  return domainName.split('.').slice(-1)[0];
};

/**
 * Groups domains by their TLD
 * @param domains Array of domain objects
 * @returns Object with TLDs as keys and arrays of domains as values
 */
export const groupByTLD = (domains: Domain[]): Record<string, Domain[]> => {
  return domains.reduce((groups, domain) => {
    const tld = domain.tld || extractTLD(domain.name);
    if (!groups[tld]) {
      groups[tld] = [];
    }
    groups[tld].push(domain);
    return groups;
  }, {} as Record<string, Domain[]>);
};

/**
 * Gets a list of all unique TLDs from an array of domains
 * @param domains Array of domain objects
 * @returns Array of unique TLDs
 */
export const getUniqueTLDs = (domains: Domain[]): string[] => {
  return [...new Set(domains.map(domain => domain.tld || extractTLD(domain.name)))];
};
