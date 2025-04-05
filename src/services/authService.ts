
import { User } from "@/types";
import { currentUser } from "@/lib/mockData";

// This is a placeholder service that will be replaced with real authentication
// when integrating with Supabase or another auth provider

// Store the current authenticated user
let authenticatedUser: User | null = currentUser; // Using mock user for now

// Mock authentication functions
export const login = async (email: string, password: string): Promise<User> => {
  // In a real app, this would validate credentials with your backend
  
  // For demo: If using admin credentials, set isAdmin to true
  if (email === "admin@notrenewing.com" && password === "admin123") {
    authenticatedUser = { ...currentUser, isAdmin: true };
  } else {
    authenticatedUser = { ...currentUser, isAdmin: false };
  }
  
  // Save to localStorage for persistence
  localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));
  
  return authenticatedUser;
};

export const register = async (email: string, name: string, password: string): Promise<User> => {
  // In a real app, this would create a new user in your database
  const newUser: User = {
    id: `user_${Math.random().toString(36).substring(7)}`,
    email,
    name,
    isAdmin: false,
    isVerified: false,
    createdAt: new Date(),
  };
  
  authenticatedUser = newUser;
  
  // Save to localStorage for persistence
  localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));
  
  return newUser;
};

export const logout = async (): Promise<void> => {
  authenticatedUser = null;
  localStorage.removeItem("currentUser");
};

export const getCurrentUser = (): User | null => {
  // Check if we have a user in memory
  if (authenticatedUser) {
    return authenticatedUser;
  }
  
  // Try to load from localStorage
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      authenticatedUser = parsedUser;
      return parsedUser;
    } catch (error) {
      console.error("Error parsing stored user:", error);
    }
  }
  
  // Default to the mock user for demo purposes
  // In a real app, this would return null
  return currentUser;
};

// Check if a user has admin privileges
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.isAdmin || false;
};
