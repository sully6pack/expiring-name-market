
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: Date;
}

export interface Domain {
  id: string;
  name: string;
  expirationDate: Date;
  description: string;
  sellerId: string;
  sellerName: string;
  likes: number;
  price: number;
  isSponsored: boolean;
  isAdminPick: boolean;
  createdAt: Date;
  category: DomainCategory;
}

export enum DomainCategory {
  Business = "business",
  Technology = "technology",
  Health = "health",
  Education = "education",
  Entertainment = "entertainment",
  Finance = "finance",
  Travel = "travel",
  Food = "food",
  Fashion = "fashion",
  Other = "other"
}

export enum LeaderboardType {
  MostLiked = "mostLiked",
  AdminPicks = "adminPicks",
  Sponsored = "sponsored"
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
