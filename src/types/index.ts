
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isVerified: boolean;
  createdAt: Date;
  // New fields
  profilePicture?: string;
  phone?: string;
  company?: string;
  verifiedAt?: Date;
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
  tld: string;
  // New fields
  isVerified?: boolean;
  verifiedAt?: Date;
  trafficStats?: TrafficStats;
  featuredUntil?: Date;
  lastUpdated?: Date;
  // Domain verification fields
  verificationStatus: VerificationStatus;
  verificationMethod?: VerificationMethod;
  verificationCode?: string;
  verificationDate?: Date;
  verificationNotes?: string;
}

export interface TrafficStats {
  monthlyVisitors?: number;
  searchVolume?: number;
  backlinks?: number;
  domainAuthority?: number;
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

export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  FAILED = "failed",
  NOT_STARTED = "not_started"
}

export enum VerificationMethod {
  DNS_TXT = "dns_txt",
  DNS_CNAME = "dns_cname",
  WHOIS_EMAIL = "whois_email",
  ADMIN_MANUAL = "admin_manual"
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export enum ListingStatus {
  ACTIVE = "active",
  PENDING = "pending", 
  EXPIRED = "expired",
  SOLD = "sold"
}

export enum TransactionType {
  DOMAIN_PURCHASE = "domain_purchase",
  LISTING_FEE = "listing_fee",
  RENEWAL_FEE = "renewal_fee",
  FEATURED_LISTING = "featured_listing"
}

export interface Transaction {
  id: string;
  userId: string;
  domainId?: string;
  domainName?: string;
  amount: number;
  type: TransactionType;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: "credit_card" | "paypal" | "crypto";
  createdAt: Date;
  completedAt?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: Date;
  link?: string;
}
