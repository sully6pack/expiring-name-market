
// Track purchased domains using localStorage
const PURCHASED_DOMAINS_KEY = 'purchasedDomains';

/**
 * Add a domain to the purchased domains list
 */
export const markDomainAsPurchased = (domainName: string): void => {
  if (!domainName) {
    console.error("Cannot mark domain as purchased: domain name is empty");
    return;
  }
  
  const normalizedDomain = domainName.toLowerCase().trim();
  console.log(`Marking domain as purchased: ${normalizedDomain}`);
  
  const purchasedDomains = getPurchasedDomains();
  if (!isDomainPurchased(normalizedDomain)) {
    purchasedDomains.push(normalizedDomain);
    localStorage.setItem(PURCHASED_DOMAINS_KEY, JSON.stringify(purchasedDomains));
    console.log(`Domain ${normalizedDomain} added to purchased list. Total purchased domains: ${purchasedDomains.length}`);
  } else {
    console.log(`Domain ${normalizedDomain} is already marked as purchased`);
  }
};

/**
 * Get all purchased domain names
 */
export const getPurchasedDomains = (): string[] => {
  const stored = localStorage.getItem(PURCHASED_DOMAINS_KEY);
  const domains = stored ? JSON.parse(stored) : [];
  return domains.map((domain: string) => domain.toLowerCase().trim());
};

/**
 * Check if a domain has been purchased
 */
export const isDomainPurchased = (domainName: string): boolean => {
  if (!domainName) return false;
  
  const normalizedDomain = domainName.toLowerCase().trim();
  const purchasedDomains = getPurchasedDomains();
  const isPurchased = purchasedDomains.includes(normalizedDomain);
  
  return isPurchased;
};

/**
 * Filter out purchased domains from a list of domains
 */
export const filterOutPurchasedDomains = (domains: any[]): any[] => {
  if (!domains || !Array.isArray(domains)) {
    console.error("Cannot filter domains: invalid domains array", domains);
    return [];
  }
  
  const purchasedDomains = getPurchasedDomains();
  console.log(`Filtering domains. Total domains: ${domains.length}, Purchased domains: ${purchasedDomains.length}`);
  
  return domains.filter(domain => {
    if (!domain || !domain.name) {
      console.warn("Invalid domain object in filter", domain);
      return false;
    }
    
    const normalizedDomain = domain.name.toLowerCase().trim();
    const isPurchased = purchasedDomains.includes(normalizedDomain);
    
    if (isPurchased) {
      console.log(`Domain ${normalizedDomain} is purchased and will be filtered out`);
    }
    
    return !isPurchased;
  });
};

/**
 * Clear all purchased domains (for debugging/testing)
 */
export const clearPurchasedDomains = (): void => {
  localStorage.removeItem(PURCHASED_DOMAINS_KEY);
  console.log("All purchased domains have been cleared");
};

/**
 * Debug function to list all purchased domains
 */
export const logPurchasedDomains = (): void => {
  const domains = getPurchasedDomains();
  console.log("Currently purchased domains:", domains);
};
