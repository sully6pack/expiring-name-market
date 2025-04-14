import { toast } from 'sonner';
import { supabase, createUserProfile, fetchCurrentUser } from '@/lib/supabase';
import { User } from '@/types';

// Authentication functions using Supabase Auth
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    // Validate inputs
    if (!email || !password) {
      toast.error('Please provide both email and password');
      return null;
    }

    console.log('Attempting login with:', { email, passwordLength: password.length });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error from Supabase:', error.message);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      return null;
    }

    if (!data || !data.user) {
      console.error('Login failed: No user returned from Supabase');
      toast.error('Login failed. Please try again.');
      return null;
    }

    console.log('Auth successful, fetching user profile for user ID:', data.user.id);
    
    // Get the user profile from our database
    const userProfile = await fetchCurrentUser();
    console.log('User profile fetched:', userProfile);
    
    if (!userProfile) {
      // Sign out the user if we can't find their profile
      console.error('Login failed: User profile not found for ID:', data.user.id);
      await supabase.auth.signOut();
      toast.error('User profile not found. Please contact support.');
      return null;
    }

    // Convert to our User type
    const user: User = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      isAdmin: userProfile.is_admin,
      isVerified: true,
      createdAt: new Date(userProfile.created_at),
    };

    console.log('Login successful:', user);
    if (user.isAdmin) {
      toast.success(`Welcome Admin ${user.name}!`);
    } else {
      toast.success('Logged in successfully');
    }
    return user;
  } catch (error) {
    console.error('Login error:', error);
    toast.error('An unexpected error occurred. Please try again.');
    return null;
  }
};

export const register = async (email: string, name: string, password: string): Promise<User | null> => {
  try {
    // Validate inputs
    if (!email || !password || password.length < 6) {
      toast.error('Please provide a valid email and password (min 6 characters)');
      return null;
    }
    
    // Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return null;
    }

    if (!data.user) {
      toast.error('Registration failed. Please try again.');
      return null;
    }

    // Create a user profile in our database
    const profileCreated = await createUserProfile(
      data.user.id,
      email,
      name || email.split('@')[0]
    );

    if (!profileCreated) {
      toast.error('Could not create user profile.');
      return null;
    }

    const user: User = {
      id: data.user.id,
      email,
      name: name || email.split('@')[0],
      isAdmin: false,
      isVerified: !!data.user.email_confirmed_at,
      createdAt: new Date(),
    };

    toast.success('Registration successful! Please check your email to verify your account.');
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    toast.error('An unexpected error occurred. Please try again.');
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    console.log('Attempting to sign out user');
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error.message);
      toast.error(error.message);
      return;
    }

    console.log('User signed out successfully');
    toast.success('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('Error during logout');
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    console.log('Getting current user from Supabase auth');
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting current user from auth:', error.message);
      return null;
    }

    if (!data || !data.user) {
      console.log('No authenticated user found');
      return null;
    }

    console.log('Auth user found, ID:', data.user.id);
    
    // Get the user profile from our database
    const userProfile = await fetchCurrentUser();
    console.log('User profile from database:', userProfile);
    
    if (!userProfile) {
      console.error('User profile not found in database');
      return null;
    }

    // Convert to our User type
    return {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      isAdmin: userProfile.is_admin,
      isVerified: true,
      createdAt: new Date(userProfile.created_at),
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.isAdmin || false;
};

export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success('Password reset instructions sent to your email');
    return true;
  } catch (error) {
    console.error('Password reset request error:', error);
    toast.error('Failed to send password reset instructions');
    return false;
  }
};

export const resetPassword = async (newPassword: string): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    toast.success('Password has been reset successfully. Please log in.');
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    toast.error('Failed to reset password');
    return false;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return !!user;
};

// New function to change password for authenticated user
export const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    // First verify the current password is correct by signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await getCurrentUser())?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      console.error('Current password verification failed:', signInError.message);
      toast.error('Current password is incorrect');
      return false;
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('Password update error:', error.message);
      toast.error(error.message || 'Failed to change password');
      return false;
    }

    toast.success('Password has been changed successfully');
    return true;
  } catch (error) {
    console.error('Password change error:', error);
    toast.error('An unexpected error occurred. Please try again.');
    return false;
  }
};
