
import { Domain, User, LeaderboardType } from "../types";

// Mock current user
export const currentUser: User = {
  id: "user1",
  email: "demo@notrenewing.com",
  name: "Demo User",
  isAdmin: true,
  isVerified: true,
  createdAt: new Date("2023-01-01"),
};

// Helper to generate dates relative to now
const getNearExpirationDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// Mock domains
export const mockDomains: Domain[] = [
  {
    id: "domain1",
    name: "greatdomain.com",
    expirationDate: getNearExpirationDate(15),
    description: "A fantastic domain for your next project",
    sellerId: "user2",
    sellerName: "Jane Smith",
    likes: 42,
    price: 99,
    isSponsored: true,
    isAdminPick: true,
    createdAt: new Date("2023-03-15"),
  },
  {
    id: "domain2",
    name: "coolwebsite.net",
    expirationDate: getNearExpirationDate(7),
    description: "Perfect for tech startups",
    sellerId: "user3",
    sellerName: "Bob Johnson",
    likes: 38,
    price: 99,
    isSponsored: false,
    isAdminPick: true,
    createdAt: new Date("2023-03-16"),
  },
  {
    id: "domain3",
    name: "bestbusiness.org",
    expirationDate: getNearExpirationDate(22),
    description: "Ideal for non-profits and organizations",
    sellerId: "user4",
    sellerName: "Alice Brown",
    likes: 56,
    price: 99,
    isSponsored: true,
    isAdminPick: false,
    createdAt: new Date("2023-03-10"),
  },
  {
    id: "domain4",
    name: "techstore.io",
    expirationDate: getNearExpirationDate(5),
    description: "Modern domain for tech products",
    sellerId: "user5",
    sellerName: "Chris Davis",
    likes: 31,
    price: 99,
    isSponsored: false,
    isAdminPick: false,
    createdAt: new Date("2023-03-18"),
  },
  {
    id: "domain5",
    name: "cryptoinvest.com",
    expirationDate: getNearExpirationDate(11),
    description: "Premium finance and crypto domain",
    sellerId: "user6",
    sellerName: "Sam Wilson",
    likes: 67,
    price: 99,
    isSponsored: true,
    isAdminPick: true,
    createdAt: new Date("2023-03-05"),
  },
  {
    id: "domain6",
    name: "travelguides.net",
    expirationDate: getNearExpirationDate(19),
    description: "Perfect for travel bloggers",
    sellerId: "user7",
    sellerName: "Emma Taylor",
    likes: 29,
    price: 99,
    isSponsored: false,
    isAdminPick: true,
    createdAt: new Date("2023-03-20"),
  },
  {
    id: "domain7",
    name: "recipebook.com",
    expirationDate: getNearExpirationDate(3),
    description: "Great for food bloggers and chefs",
    sellerId: "user8",
    sellerName: "Michael Green",
    likes: 51,
    price: 99,
    isSponsored: true,
    isAdminPick: false,
    createdAt: new Date("2023-03-12"),
  },
  {
    id: "domain8",
    name: "fitnesslife.org",
    expirationDate: getNearExpirationDate(28),
    description: "Perfect for fitness trainers",
    sellerId: "user9",
    sellerName: "Lisa Robinson",
    likes: 44,
    price: 99,
    isSponsored: false,
    isAdminPick: false,
    createdAt: new Date("2023-03-08"),
  },
  {
    id: "domain9",
    name: "artgallery.net",
    expirationDate: getNearExpirationDate(9),
    description: "Showcase your creative work",
    sellerId: "user10",
    sellerName: "David Black",
    likes: 36,
    price: 99,
    isSponsored: true,
    isAdminPick: true,
    createdAt: new Date("2023-03-25"),
  },
  {
    id: "domain10",
    name: "petrescue.org",
    expirationDate: getNearExpirationDate(14),
    description: "Support animal welfare causes",
    sellerId: "user11",
    sellerName: "Sarah White",
    likes: 62,
    price: 99,
    isSponsored: false,
    isAdminPick: true,
    createdAt: new Date("2023-03-01"),
  },
];

export const getLeaderboard = (type: LeaderboardType): Domain[] => {
  let filteredDomains = [...mockDomains];
  
  switch (type) {
    case LeaderboardType.MostLiked:
      return filteredDomains.sort((a, b) => b.likes - a.likes).slice(0, 10);
    case LeaderboardType.AdminPicks:
      return filteredDomains.filter(domain => domain.isAdminPick).slice(0, 10);
    case LeaderboardType.Sponsored:
      return filteredDomains.filter(domain => domain.isSponsored).slice(0, 10);
    default:
      return filteredDomains.slice(0, 10);
  }
};

// Function to emulate API calls with a delay
export function delay<T>(data: T, ms = 500): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
}
