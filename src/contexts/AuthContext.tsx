
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as AppUser } from '@/types';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, name: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to our app user format
  const convertToAppUser = async (user: User): Promise<AppUser | null> => {
    if (!user) return null;

    try {
      // Fetch user data from our users table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.log('No user profile found, creating fallback profile');
        return {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          isAdmin: user.email === 'admin@notrenewing.com', // Fallback admin check
          isVerified: !!user.email_confirmed_at,
          createdAt: new Date(user.created_at || Date.now()),
        };
      }
      
      const appUser: AppUser = {
        id: data.id,
        email: data.email,
        name: data.name || data.email.split('@')[0],
        isAdmin: data.is_admin || false,
        isVerified: !!data.verified_at,
        createdAt: new Date(data.created_at),
        verifiedAt: data.verified_at ? new Date(data.verified_at) : undefined,
        profilePicture: data.profile_image_url,
        phone: data.phone,
        company: data.company,
      };
      
      return appUser;
    } catch (error) {
      console.error('Error in convertToAppUser:', error);
      return null;
    }
  };

  // Create a user profile in our database
  const createUserProfile = async (userId: string, email: string, name: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          name,
          is_admin: false,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error creating user profile:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return false;
    }
  };

  // Refresh the user data
  const refreshUser = async (): Promise<void> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user) {
        setUser(sessionData.session.user);
        const appUserData = await convertToAppUser(sessionData.session.user);
        setAppUser(appUserData);
        setSession(sessionData.session);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Use setTimeout to avoid potential deadlock with Supabase client
        if (currentSession?.user) {
          setTimeout(() => {
            convertToAppUser(currentSession.user).then(appUserData => {
              setAppUser(appUserData);
              setIsLoading(false);
            });
          }, 0);
        } else {
          setAppUser(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        convertToAppUser(currentSession.user).then(appUserData => {
          setAppUser(appUserData);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Login failed. Please try again.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const signUp = async (email: string, name: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Registration failed. Please try again.' };
      }

      // Create a user profile in our database
      const profileCreated = await createUserProfile(
        data.user.id,
        email,
        name || email.split('@')[0]
      );

      if (!profileCreated) {
        return { success: false, error: 'Failed to create user profile.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAppUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        appUser,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
