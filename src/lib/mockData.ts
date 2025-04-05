
import { User, Domain, DomainCategory, LeaderboardType } from "@/types";

export const mockDomains: Domain[] = [
  {
    id: "domain1",
    name: "example.com",
    expirationDate: new Date("2024-05-03"),
    description: "A generic example domain for testing purposes.",
    sellerId: "user1",
    sellerName: "John Doe",
    likes: 15,
    price: 99,
    isSponsored: false,
    isAdminPick: true,
    createdAt: new Date(),
    category: DomainCategory.Technology,
    tld: "com",
  },
  {
    id: "domain2",
    name: "techinnovations.io",
    expirationDate: new Date("2024-05-15"),
    description: "Innovative tech solutions and resources.",
    sellerId: "user2",
    sellerName: "Alice Smith",
    likes: 28,
    price: 99,
    isSponsored: true,
    isAdminPick: false,
    createdAt: new Date(),
    category: DomainCategory.Technology,
    tld: "io",
  },
  {
    id: "domain3",
    name: "healthfirst.org",
    expirationDate: new Date("2024-06-01"),
    description: "Your primary source for health-related information.",
    sellerId: "user3",
    sellerName: "Bob Johnson",
    likes: 8,
    price: 99,
    isSponsored: false,
    isAdminPick: false,
    createdAt: new Date(),
    category: DomainCategory.Health,
    tld: "org",
  },
  {
    id: "domain4",
    name: "traveladventures.net",
    expirationDate: new Date("2024-06-10"),
    description: "Plan your next adventure with us!",
    sellerId: "user1",
    sellerName: "John Doe",
    likes: 35,
    price: 99,
    isSponsored: true,
    isAdminPick: true,
    createdAt: new Date(),
    category: DomainCategory.Travel,
    tld: "net",
  },
  {
    id: "domain5",
    name: "businesssolutions.biz",
    expirationDate: new Date("2024-07-01"),
    description: "Providing top-notch business solutions for growth.",
    sellerId: "user2",
    sellerName: "Alice Smith",
    likes: 12,
    price: 99,
    isSponsored: false,
    isAdminPick: false,
    createdAt: new Date(),
    category: DomainCategory.Business,
    tld: "biz",
  },
  {
    id: "domain6",
    name: "educationplus.info",
    expirationDate: new Date("2024-07-15"),
    description: "Enhancing education through innovative resources.",
    sellerId: "user3",
    sellerName: "Bob Johnson",
    likes: 20,
    price: 99,
    isSponsored: true,
    isAdminPick: false,
    createdAt: new Date(),
    category: DomainCategory.Education,
    tld: "info",
  },
  {
    id: "domain7",
    name: "financeforward.co",
    expirationDate: new Date("2024-08-01"),
    description: "Moving finance forward with expert insights.",
    sellerId: "user1",
    sellerName: "John Doe",
    likes: 42,
    price: 99,
    isSponsored: false,
    isAdminPick: true,
    createdAt: new Date(),
    category: DomainCategory.Finance,
    tld: "co",
  },
  {
    id: "domain8",
    name: "entertainmentnow.tv",
    expirationDate: new Date("2024-08-15"),
    description: "Your go-to source for the latest entertainment news.",
    sellerId: "user2",
    sellerName: "Alice Smith",
    likes: 10,
    price: 99,
    isSponsored: true,
    isAdminPick: false,
    createdAt: new Date(),
    category: DomainCategory.Entertainment,
    tld: "tv",
  },
  {
    id: "domain9",
    name: "fashiontrends.store",
    expirationDate: new Date("2024-09-01"),
    description: "Stay ahead of the curve with the latest fashion trends.",
    sellerId: "user3",
    sellerName: "Bob Johnson",
    likes: 18,
    price: 99,
    isSponsored: false,
    isAdminPick: false,
    createdAt: new Date(),
    category: DomainCategory.Fashion,
    tld: "store",
  },
  {
    id: "domain10",
    name: "foodlovers.blog",
    expirationDate: new Date("2024-09-15"),
    description: "A blog dedicated to food lovers everywhere.",
    sellerId: "user1",
    sellerName: "John Doe",
    likes: 25,
    price: 99,
    isSponsored: true,
    isAdminPick: true,
    createdAt: new Date(),
    category: DomainCategory.Food,
    tld: "blog",
  },
];

export const currentUser: User = {
  id: "user123",
  email: "test@example.com",
  name: "Test User",
  isAdmin: true,
  isVerified: true,
  createdAt: new Date(),
};

export const initializeGlobalDomains = () => {
  if (typeof window !== 'undefined') {
    try {
      console.log('Initializing global domains...');
      
      // Create window.globalDomains if it doesn't exist
      if (!window.globalDomains) {
        window.globalDomains = [];
      }
      
      // First try to load from localStorage
      const storedDomains = localStorage.getItem('globalDomains');
      
      if (!storedDomains) {
        // If localStorage is empty, initialize with mockDomains
        console.log('No domains in localStorage, initializing with mockDomains');
        const serializedDomains = JSON.stringify(mockDomains);
        localStorage.setItem('globalDomains', serializedDomains);
        window.globalDomains = [...mockDomains];
      } else {
        try {
          // Parse stored domains and fix date objects
          console.log('Found domains in localStorage, loading them');
          const parsedDomains = JSON.parse(storedDomains);
          
          // Handle the case where localStorage might have invalid data
          if (!Array.isArray(parsedDomains) || parsedDomains.length === 0) {
            console.log('Invalid or empty domains in localStorage, resetting to mockDomains');
            localStorage.setItem('globalDomains', JSON.stringify(mockDomains));
            window.globalDomains = [...mockDomains];
          } else {
            // Convert ISO date strings back to Date objects
            const domainsWithDates = parsedDomains.map((domain: any) => ({
              ...domain,
              expirationDate: new Date(domain.expirationDate),
              createdAt: new Date(domain.createdAt)
            }));
            
            window.globalDomains = domainsWithDates;
          }
        } catch (error) {
          console.error('Error parsing domains from localStorage:', error);
          // Fallback to mockDomains if there's an error parsing
          localStorage.setItem('globalDomains', JSON.stringify(mockDomains));
          window.globalDomains = [...mockDomains];
        }
      }
      
      console.log('Domains initialization complete:', {
        windowGlobalDomains: window.globalDomains.length,
        mockDomains: mockDomains.length
      });
    } catch (error) {
      console.error('Error initializing globalDomains:', error);
      // Final fallback
      window.globalDomains = [...mockDomains];
    }
  }
};

export const getLeaderboard = (type: LeaderboardType, customDomains?: Domain[]): Domain[] => {
  const domains = customDomains || mockDomains;
  
  switch (type) {
    case LeaderboardType.MostLiked:
      return [...domains].sort((a, b) => b.likes - a.likes);
    case LeaderboardType.AdminPicks:
      return domains.filter(domain => domain.isAdminPick);
    case LeaderboardType.Sponsored:
      return domains.filter(domain => domain.isSponsored);
    default:
      return domains;
  }
};
