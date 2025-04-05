
import { User } from "@/types";
import { currentUser } from "@/lib/mockData";
import { toast } from "sonner";
import { sendEmail } from "./emailService";

// Store the current authenticated user
let authenticatedUser: User | null = currentUser; // Using mock user for now

// Mock authentication functions - will be replaced with Supabase Auth in production
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // In a real app, this would validate credentials with your backend
    
    // For demo: If using admin credentials, set isAdmin to true
    if (email === "admin@notrenewing.com" && password === "admin123") {
      authenticatedUser = { ...currentUser, isAdmin: true };
      toast.success("Logged in as admin");
    } else if (email && password.length >= 6) {
      authenticatedUser = { 
        ...currentUser, 
        email, 
        isAdmin: false,
        name: email.split('@')[0] // Simple name extraction for demo
      };
      toast.success("Logged in successfully");
    } else {
      toast.error("Invalid credentials");
      return null;
    }
    
    // Save to localStorage for persistence
    localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));
    
    // Log success for development
    console.log(`User logged in: ${authenticatedUser.email}, Admin: ${authenticatedUser.isAdmin}`);
    
    return authenticatedUser;
  } catch (error) {
    console.error("Login error:", error);
    toast.error("Login failed. Please try again.");
    return null;
  }
};

export const register = async (email: string, name: string, password: string): Promise<User | null> => {
  try {
    // Validate input
    if (!email || !password || password.length < 6) {
      toast.error("Please provide a valid email and password (min 6 characters)");
      return null;
    }
    
    // In a real app, this would create a new user in your database
    const newUser: User = {
      id: `user_${Math.random().toString(36).substring(7)}`,
      email,
      name: name || email.split('@')[0], // Use name if provided, otherwise extract from email
      isAdmin: false,
      isVerified: false,
      createdAt: new Date(),
    };
    
    authenticatedUser = newUser;
    
    // Save to localStorage for persistence
    localStorage.setItem("currentUser", JSON.stringify(authenticatedUser));
    
    // Send welcome email
    sendEmail("WELCOME", {
      to: email,
      subject: "Welcome to NotRenewing.com",
      templateData: {
        name: newUser.name
      }
    });
    
    toast.success("Registration successful!");
    console.log(`New user registered: ${newUser.email}`);
    
    return newUser;
  } catch (error) {
    console.error("Registration error:", error);
    toast.error("Registration failed. Please try again.");
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    authenticatedUser = null;
    localStorage.removeItem("currentUser");
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Error during logout");
  }
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
  
  // For demo purposes, return the mock user
  // In a real app with Supabase, this would return null if not authenticated
  return currentUser;
};

// Check if a user has admin privileges
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.isAdmin || false;
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    if (!email) {
      toast.error("Please provide an email address");
      return false;
    }
    
    // In production, this would generate a reset token and send an email
    console.log(`Password reset requested for: ${email}`);
    
    // Simulate sending an email
    await sendEmail("PASSWORD_RESET", {
      to: email,
      templateData: {
        resetLink: `https://notrenewing.com/reset-password?token=demo-token-${Date.now()}`
      }
    });
    
    toast.success("Password reset instructions sent to your email");
    return true;
  } catch (error) {
    console.error("Password reset request error:", error);
    toast.error("Failed to send password reset instructions");
    return false;
  }
};

// For demo, simulate a token validation
export const validateResetToken = (token: string): boolean => {
  // In production, this would validate the token with your backend
  return token.startsWith("demo-token-");
};

// Reset password with token
export const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
  try {
    // Validate token and password
    if (!validateResetToken(token) || !newPassword || newPassword.length < 6) {
      toast.error("Invalid token or password too short");
      return false;
    }
    
    // In production, this would update the user's password in your backend
    console.log(`Password reset with token: ${token}`);
    
    toast.success("Password has been reset successfully. Please log in.");
    return true;
  } catch (error) {
    console.error("Password reset error:", error);
    toast.error("Failed to reset password");
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

