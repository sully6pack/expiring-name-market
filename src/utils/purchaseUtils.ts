
// Track purchased domains using localStorage
const PURCHASED_DOMAINS_KEY = 'purchasedDomains';

/**
 * Add a domain to the purchased domains list
 */
export const markDomainAsPurchased = (domainName: string): void => {
  const purchasedDomains = getPurchasedDomains();
  if (!purchasedDomains.includes(domainName)) {
    purchasedDomains.push(domainName);
    localStorage.setItem(PURCHASED_DOMAINS_KEY, JSON.stringify(purchasedDomains));
  }
};

/**
 * Get all purchased domain names
 */
export const getPurchasedDomains = (): string[] => {
  const stored = localStorage.getItem(PURCHASED_DOMAINS_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Check if a domain has been purchased
 */
export const isDomainPurchased = (domainName: string): boolean => {
  return getPurchasedDomains().includes(domainName);
};

/**
 * Filter out purchased domains from a list of domains
 */
export const filterOutPurchasedDomains = (domains: any[]): any[] => {
  const purchasedDomains = getPurchasedDomains();
  return domains.filter(domain => !purchasedDomains.includes(domain.name));
};
