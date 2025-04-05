
import { Domain, DomainCategory, User } from "@/types";
import { getCurrentUser, isAdmin } from "./authService";
import { getAllDomains, updateDomain, deleteDomain } from "./domainService";

export interface AdminStats {
  totalDomains: number;
  totalUsers: number;
  pendingVerifications: number;
  activeSellers: number;
  recentPurchases: number;
  revenue: number;
}

// This would be connected to a real database in production
export const getAdminStats = (): AdminStats | null => {
  if (!isAdmin()) {
    console.error("Unauthorized access to admin stats");
    return null;
  }

  // Mocked stats for development
  return {
    totalDomains: getAllDomains().length,
    totalUsers: 125,  // would come from a real user database
    pendingVerifications: 3,
    activeSellers: 42,
    recentPurchases: 17,
    revenue: 24950.00
  };
};

export const verifyDomain = (domainId: string): boolean => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to verify domain");
    return false;
  }

  const domain = getAllDomains().find(d => d.id === domainId);
  if (!domain) return false;

  const updatedDomain: Domain = {
    ...domain,
    isVerified: true,
    verifiedAt: new Date()
  };

  return updateDomain(updatedDomain);
};

export const setDomainAsAdminPick = (domainId: string, isAdminPick: boolean): boolean => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to set admin pick");
    return false;
  }

  const domain = getAllDomains().find(d => d.id === domainId);
  if (!domain) return false;

  const updatedDomain: Domain = {
    ...domain,
    isAdminPick
  };

  return updateDomain(updatedDomain);
};

export const setDomainAsSponsored = (domainId: string, isSponsored: boolean): boolean => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to set sponsored status");
    return false;
  }

  const domain = getAllDomains().find(d => d.id === domainId);
  if (!domain) return false;

  const updatedDomain: Domain = {
    ...domain,
    isSponsored
  };

  return updateDomain(updatedDomain);
};

export const updateDomainCategory = (domainId: string, category: DomainCategory): boolean => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to update domain category");
    return false;
  }

  const domain = getAllDomains().find(d => d.id === domainId);
  if (!domain) return false;

  const updatedDomain: Domain = {
    ...domain,
    category
  };

  return updateDomain(updatedDomain);
};

export const removeDomain = (domainId: string): boolean => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to remove domain");
    return false;
  }

  return deleteDomain(domainId);
};

// In production, this would manage users from a real database
export const getUserManagementInfo = (): User[] => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to access user management");
    return [];
  }
  
  // Mocked users for development
  return [
    {
      id: "user_1",
      email: "user1@example.com",
      name: "John Doe",
      isAdmin: false,
      isVerified: true,
      createdAt: new Date(2023, 1, 15),
    },
    {
      id: "user_2",
      email: "user2@example.com",
      name: "Jane Smith",
      isAdmin: false,
      isVerified: false,
      createdAt: new Date(2023, 2, 20),
    },
    // More mock users would be here
  ];
};

