import { Domain, DomainCategory, User, VerificationStatus } from "@/types";
import { getCurrentUser, isAdmin } from "./authService";
import { getAllDomains, updateDomain, deleteDomain } from "./domainService";
import { fetchDomainExpirationDate } from "./domainVerificationService";

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

  const allDomains = getAllDomains();
  const pendingVerifications = allDomains.filter(
    d => d.verificationStatus === VerificationStatus.PENDING
  ).length;

  // Mocked stats for development
  return {
    totalDomains: allDomains.length,
    totalUsers: 125,  // would come from a real user database
    pendingVerifications,
    activeSellers: 42,
    recentPurchases: 17,
    revenue: 24950.00
  };
};

export const verifyDomain = async (domainId: string): Promise<boolean> => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to verify domain");
    return false;
  }

  const domain = getAllDomains().find(d => d.id === domainId);
  if (!domain) return false;
  
  // Fetch expiration date if possible
  const expirationDate = await fetchDomainExpirationDate(domain.name);

  const updatedDomain: Domain = {
    ...domain,
    isVerified: true,
    verifiedAt: new Date(),
    verificationStatus: VerificationStatus.VERIFIED,
    // Update expiration date if found
    ...(expirationDate && { expirationDate })
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
      email: "john@example.com",
      name: "John Doe",
      isAdmin: false,
      isVerified: true,
      createdAt: new Date(2023, 1, 15),
      verifiedAt: new Date(2023, 1, 16),
    },
    {
      id: "user_2",
      email: "jane@example.com",
      name: "Jane Smith",
      isAdmin: false,
      isVerified: false,
      createdAt: new Date(2023, 2, 20),
    },
    {
      id: "user_3",
      email: "admin@example.com",
      name: "Admin User",
      isAdmin: true,
      isVerified: true,
      createdAt: new Date(2022, 10, 5),
      verifiedAt: new Date(2022, 10, 5),
    },
    {
      id: "user_4",
      email: "sarah@example.com",
      name: "Sarah Johnson",
      isAdmin: false,
      isVerified: true,
      createdAt: new Date(2023, 4, 10),
      verifiedAt: new Date(2023, 4, 12),
    },
    {
      id: "user_5",
      email: "mike@example.com",
      name: "Mike Wilson",
      isAdmin: false,
      isVerified: false,
      createdAt: new Date(2023, 5, 25),
    },
  ];
};

// Get pending domain verifications
export const getPendingDomainVerifications = (): Domain[] => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to access pending verifications");
    return [];
  }
  
  const allDomains = getAllDomains();
  return allDomains.filter(domain => domain.verificationStatus === VerificationStatus.PENDING);
};

// Reject domain verification
export const rejectDomainVerification = (domainId: string, notes?: string): boolean => {
  if (!isAdmin()) {
    console.error("Unauthorized attempt to reject domain verification");
    return false;
  }
  
  const domain = getAllDomains().find(d => d.id === domainId);
  if (!domain) return false;
  
  const updatedDomain: Domain = {
    ...domain,
    verificationStatus: VerificationStatus.FAILED,
    verificationDate: new Date(),
    verificationNotes: notes || "Rejected by admin"
  };
  
  return updateDomain(updatedDomain);
};
