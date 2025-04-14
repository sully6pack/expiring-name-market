import { Domain, DomainCategory, VerificationStatus } from "@/types";
import { mockDomains } from "@/lib/mockData";
import { getPurchasedDomains, isDomainPurchased } from "@/utils/purchaseUtils";
import { extractTLD } from "@/utils/domainUtils";

// Initialize domains if not already initialized
const initializeDomains = (): Domain[] => {
  try {
    const storedDomains = localStorage.getItem("globalDomains");
    if (storedDomains) {
      const parsedDomains = JSON.parse(storedDomains);
      
      // Ensure the parsed data is valid
      if (Array.isArray(parsedDomains) && parsedDomains.length > 0) {
        // Convert string dates back to Date objects
        const formattedDomains = parsedDomains.map((domain: any) => ({
          ...domain,
          expirationDate: new Date(domain.expirationDate),
          createdAt: new Date(domain.createdAt),
          // Set default verification status if not present
          verificationStatus: domain.verificationStatus || VerificationStatus.NOT_STARTED
        }));
        
        window.globalDomains = formattedDomains;
        console.log("Initialized domains from localStorage:", formattedDomains.length);
        return formattedDomains;
      }
    }
    
    // If no valid domains in localStorage, use mock domains with verification status
    const mocksWithVerification = mockDomains.map(domain => ({
      ...domain,
      verificationStatus: VerificationStatus.VERIFIED
    }));
    window.globalDomains = [...mocksWithVerification];
    console.log("Using mock domains:", mocksWithVerification.length);
    return [...mocksWithVerification];
  } catch (error) {
    console.error("Error initializing domains:", error);
    const mocksWithVerification = mockDomains.map(domain => ({
      ...domain,
      verificationStatus: VerificationStatus.VERIFIED
    }));
    window.globalDomains = [...mocksWithVerification];
    return [...mocksWithVerification];
  }
};

// Get all domains
export const getAllDomains = (): Domain[] => {
  if (!window.globalDomains) {
    return initializeDomains();
  }
  
  // Make sure to validate dates
  const domains = window.globalDomains.map(domain => ({
    ...domain,
    expirationDate: domain.expirationDate instanceof Date ? 
      domain.expirationDate : new Date(domain.expirationDate),
    createdAt: domain.createdAt instanceof Date ? 
      domain.createdAt : new Date(domain.createdAt)
  }));
  
  console.log(`Getting all domains: ${domains.length} total`);
  return domains;
};

// Get available domains (not purchased)
export const getAvailableDomains = (): Domain[] => {
  const allDomains = getAllDomains();
  const purchasedDomainNames = getPurchasedDomains();
  
  return allDomains.filter(domain => !purchasedDomainNames.includes(domain.name.toLowerCase()));
};

// Get verified domains
export const getVerifiedDomains = (): Domain[] => {
  const allDomains = getAllDomains();
  return allDomains.filter(domain => domain.verificationStatus === VerificationStatus.VERIFIED);
};

// Get domains by seller ID
export const getDomainsBySeller = (sellerId: string): Domain[] => {
  const allDomains = getAllDomains();
  return allDomains.filter(domain => domain.sellerId === sellerId);
};

// Get available domains by seller ID
export const getAvailableDomainsBySeller = (sellerId: string): Domain[] => {
  const sellerDomains = getDomainsBySeller(sellerId);
  return sellerDomains.filter(domain => !isDomainPurchased(domain.name));
};

// Get domain by ID
export const getDomainById = (id: string): Domain | undefined => {
  const allDomains = getAllDomains();
  return allDomains.find(domain => domain.id === id);
};

// Add a new domain
export const addDomain = (domainData: {
  name: string;
  expirationDate: Date;
  description: string;
  sellerId: string;
  sellerName: string;
  category: DomainCategory;
}): Domain => {
  const tld = extractTLD(domainData.name) || "";
  
  const newDomain: Domain = {
    id: `domain_${Math.random().toString(36).substring(7)}`,
    name: domainData.name,
    expirationDate: domainData.expirationDate,
    description: domainData.description,
    sellerId: domainData.sellerId,
    sellerName: domainData.sellerName,
    likes: 0,
    price: 99, // Fixed price at $99
    isSponsored: false,
    isAdminPick: false,
    createdAt: new Date(),
    category: domainData.category,
    tld,
    verificationStatus: VerificationStatus.VERIFIED // Mark as verified immediately for demo purposes
  };
  
  if (!window.globalDomains) {
    initializeDomains();
  }
  
  // Add the new domain at the beginning of the array
  window.globalDomains = [newDomain, ...window.globalDomains];
  console.log(`Added new domain: ${newDomain.name}. Total domains: ${window.globalDomains.length}`);
  
  // Save to localStorage
  try {
    localStorage.setItem("globalDomains", JSON.stringify(window.globalDomains));
  } catch (error) {
    console.error("Error saving domain to localStorage:", error);
  }
  
  return newDomain;
};

// Delete a domain
export const deleteDomain = (domainId: string): boolean => {
  if (!window.globalDomains) {
    initializeDomains();
  }
  
  const initialLength = window.globalDomains.length;
  window.globalDomains = window.globalDomains.filter(domain => domain.id !== domainId);
  
  // Save to localStorage
  try {
    localStorage.setItem("globalDomains", JSON.stringify(window.globalDomains));
  } catch (error) {
    console.error("Error saving domains to localStorage after deletion:", error);
    return false;
  }
  
  return window.globalDomains.length < initialLength;
};

// Update a domain
export const updateDomain = (updatedDomain: Domain): boolean => {
  if (!window.globalDomains) {
    initializeDomains();
  }
  
  const index = window.globalDomains.findIndex(domain => domain.id === updatedDomain.id);
  if (index === -1) {
    return false;
  }
  
  window.globalDomains[index] = { ...updatedDomain };
  
  // Save to localStorage
  try {
    localStorage.setItem("globalDomains", JSON.stringify(window.globalDomains));
    return true;
  } catch (error) {
    console.error("Error saving updated domain to localStorage:", error);
    return false;
  }
};
