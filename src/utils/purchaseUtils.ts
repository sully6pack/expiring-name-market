
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
  try {
    const stored = localStorage.getItem(PURCHASED_DOMAINS_KEY);
    if (!stored) return [];
    
    const domains = JSON.parse(stored);
    if (!Array.isArray(domains)) {
      console.error("Invalid purchased domains format in localStorage, resetting");
      localStorage.removeItem(PURCHASED_DOMAINS_KEY);
      return [];
    }
    
    // Normalize all domains
    return domains.map((domain: string) => domain.toLowerCase().trim());
  } catch (error) {
    console.error("Error parsing purchased domains:", error);
    return [];
  }
};

/**
 * Check if a domain has been purchased
 */
export const isDomainPurchased = (domainName: string): boolean => {
  if (!domainName) return false;
  
  const normalizedDomain = domainName.toLowerCase().trim();
  const purchasedDomains = getPurchasedDomains();
  
  console.log(`Checking if domain is purchased: ${normalizedDomain}`);
  console.log(`Currently purchased domains:`, purchasedDomains);
  
  const isPurchased = purchasedDomains.includes(normalizedDomain);
  console.log(`Domain ${normalizedDomain} purchased status: ${isPurchased}`);
  
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
  logPurchasedDomains();
  
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

/**
 * Add this function to check for domain purchase in the checkout success page
 */
export const checkAndReloadIfPurchased = (domainName: string): boolean => {
  if (isDomainPurchased(domainName)) {
    console.log(`Domain ${domainName} was already purchased. Reloading page to update UI.`);
    setTimeout(() => window.location.reload(), 1000);
    return true;
  }
  return false;
};
