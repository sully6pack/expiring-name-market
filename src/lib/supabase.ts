
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Initialize the Supabase client with fallback values for development
// In production, these should be set in the Supabase project settings
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Show a warning if we're using fallback values
if (supabaseUrl === 'https://your-project-url.supabase.co' || 
    supabaseAnonKey === 'your-anon-key') {
  console.warn('Using fallback Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Supabase project settings.');
  toast.warning('Supabase credentials not set. Some features may not work correctly.');
}

// Database types - matching our Supabase schema
export type DbUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  is_admin: boolean;
  profile_image_url?: string;
};

export type DbDomain = {
  id: string;
  name: string;
  description: string;
  expiration_date: string;
  seller_id: string;
  seller_name: string;
  likes: number;
  price: number;
  is_sponsored: boolean;
  is_admin_pick: boolean;
  created_at: string;
  category: string;
  tld: string;
  verification_status: string;
  verification_method?: string;
  verification_code?: string;
  verification_date?: string;
  verification_notes?: string;
  is_verified: boolean;
  buyer_id?: string;
  purchase_date?: string;
};

export type DbTransaction = {
  id: string;
  domain_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: string;
  created_at: string;
  completed_at?: string;
  payment_intent_id?: string;
};

// Utility functions for database operations
export const fetchCurrentUser = async (): Promise<DbUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get the profile data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data as DbUser;
  } catch (error) {
    console.error('Error in fetchCurrentUser:', error);
    return null;
  }
};

export const createUserProfile = async (
  userId: string,
  email: string,
  name: string
): Promise<boolean> => {
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

// Domain-related functions
export const fetchAllDomains = async (): Promise<DbDomain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
    
    return data as DbDomain[];
  } catch (error) {
    console.error('Error in fetchAllDomains:', error);
    return [];
  }
};

export const fetchDomainById = async (id: string): Promise<DbDomain | null> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching domain:', error);
      return null;
    }
    
    return data as DbDomain;
  } catch (error) {
    console.error('Error in fetchDomainById:', error);
    return null;
  }
};

export const createDomain = async (domainData: Partial<DbDomain>): Promise<DbDomain | null> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .insert({
        ...domainData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating domain:', error);
      return null;
    }
    
    return data as DbDomain;
  } catch (error) {
    console.error('Error in createDomain:', error);
    return null;
  }
};

export const updateDomainVerification = async (
  domainId: string,
  verificationData: {
    verification_status: string;
    verification_method?: string;
    verification_code?: string;
    verification_date?: string;
    verification_notes?: string;
    is_verified: boolean;
  }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('domains')
      .update(verificationData)
      .eq('id', domainId);
    
    if (error) {
      console.error('Error updating domain verification:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateDomainVerification:', error);
    return false;
  }
};

// Transaction-related functions
export const createTransaction = async (
  transactionData: Partial<DbTransaction>
): Promise<DbTransaction | null> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
    
    return data as DbTransaction;
  } catch (error) {
    console.error('Error in createTransaction:', error);
    return null;
  }
};

export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  paymentIntentId?: string
): Promise<boolean> => {
  try {
    const updateData: any = { 
      status,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    };

    if (paymentIntentId) {
      updateData.payment_intent_id = paymentIntentId;
    }

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);
    
    if (error) {
      console.error('Error updating transaction:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateTransactionStatus:', error);
    return false;
  }
};

// Helper to convert Supabase types to our app types
export const convertDbDomainToDomain = (dbDomain: DbDomain) => {
  return {
    id: dbDomain.id,
    name: dbDomain.name,
    description: dbDomain.description,
    expirationDate: new Date(dbDomain.expiration_date),
    sellerId: dbDomain.seller_id,
    sellerName: dbDomain.seller_name,
    likes: dbDomain.likes,
    price: dbDomain.price,
    isSponsored: dbDomain.is_sponsored,
    isAdminPick: dbDomain.is_admin_pick,
    createdAt: new Date(dbDomain.created_at),
    category: dbDomain.category,
    tld: dbDomain.tld,
    verificationStatus: dbDomain.verification_status,
    verificationMethod: dbDomain.verification_method,
    verificationCode: dbDomain.verification_code,
    verificationDate: dbDomain.verification_date ? new Date(dbDomain.verification_date) : undefined,
    verificationNotes: dbDomain.verification_notes,
    isVerified: dbDomain.is_verified,
    buyerId: dbDomain.buyer_id,
    purchaseDate: dbDomain.purchase_date ? new Date(dbDomain.purchase_date) : undefined
  };
};
