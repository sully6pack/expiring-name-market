
import { User } from "@/types";
import { getCurrentUser } from "./authService";

// In production, this would update user data in a database
export const updateUserProfile = async (
  profileData: Partial<User>
): Promise<User | null> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error("No user logged in to update profile");
      return null;
    }

    // Update user profile in localStorage for demo purposes
    // In production, this would call a backend API
    const updatedUser: User = {
      ...currentUser,
      ...profileData,
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    console.log("User profile updated:", updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};

// Upload profile picture (would use Supabase Storage in production)
export const uploadProfilePicture = async (
  file: File
): Promise<{ url: string } | null> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.error("No user logged in to upload profile picture");
      return null;
    }

    // In production, this would upload to Supabase Storage
    // and return the public URL
    
    // For demo, simulate upload success
    console.log("Profile picture upload:", file.name);
    
    // Create a fake URL for demo purposes
    const url = `https://example.com/profile-pics/${currentUser.id}/${file.name}`;
    
    // Update user profile with the new picture URL
    await updateUserProfile({ profilePicture: url });
    
    return { url };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return null;
  }
};

// Get user public profile (visible to other users)
export const getUserPublicProfile = (userId: string): Partial<User> | null => {
  // In production, this would fetch from a database
  
  // For demo, simulate fetching a user
  if (userId === "demo_user") {
    return {
      id: "demo_user",
      name: "Demo User",
      isVerified: true,
      // Only return fields that should be public
    };
  }
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    // Return a sanitized version of current user
    const { email, isAdmin, ...publicProfile } = currentUser;
    return publicProfile;
  }
  
  console.log(`Fetching public profile for user: ${userId}`);
  return null;
};

