
import { supabase, convertDbDomainToDomain, fetchDomainById, updateDomainVerification } from '@/lib/supabase';
import { Domain, DomainCategory, VerificationStatus, VerificationMethod } from '@/types';
import { extractTLD } from '@/utils/domainUtils';

// Helper function to ensure domain category is a valid DomainCategory enum
const validateDomainCategory = (category: string): DomainCategory => {
  if (Object.values(DomainCategory).includes(category as DomainCategory)) {
    return category as DomainCategory;
  }
  return DomainCategory.Other;
};

// Helper function to ensure verification status is a valid VerificationStatus enum
const validateVerificationStatus = (status: string): VerificationStatus => {
  if (Object.values(VerificationStatus).includes(status as VerificationStatus)) {
    return status as VerificationStatus;
  }
  return VerificationStatus.NOT_STARTED;
};

// Helper function to ensure verification method is a valid VerificationMethod enum
const validateVerificationMethod = (method?: string): VerificationMethod | undefined => {
  if (!method) return undefined;
  
  if (Object.values(VerificationMethod).includes(method as VerificationMethod)) {
    return method as VerificationMethod;
  }
  return undefined;
};

// Enhance conversion to properly handle category type and verification status
const enhancedConvertDbDomainToDomain = (dbDomain: any): Domain => {
  const baseDomain = convertDbDomainToDomain(dbDomain);
  return {
    ...baseDomain,
    category: validateDomainCategory(dbDomain.category),
    verificationStatus: validateVerificationStatus(dbDomain.verification_status),
    verificationMethod: validateVerificationMethod(dbDomain.verification_method)
  };
};

// Get all domains
export const getAllDomains = async (): Promise<Domain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching domains:', error);
      return [];
    }
    
    return data.map(enhancedConvertDbDomainToDomain);
  } catch (error) {
    console.error('Error in getAllDomains:', error);
    return [];
  }
};

// Get available domains (not purchased)
export const getAvailableDomains = async (): Promise<Domain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .is('buyer_id', null)
      .eq('is_verified', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available domains:', error);
      return [];
    }
    
    return data.map(enhancedConvertDbDomainToDomain);
  } catch (error) {
    console.error('Error in getAvailableDomains:', error);
    return [];
  }
};

// Get verified domains
export const getVerifiedDomains = async (): Promise<Domain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('verification_status', VerificationStatus.VERIFIED)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching verified domains:', error);
      return [];
    }
    
    return data.map(enhancedConvertDbDomainToDomain);
  } catch (error) {
    console.error('Error in getVerifiedDomains:', error);
    return [];
  }
};

// Get domains by seller ID
export const getDomainsBySeller = async (sellerId: string): Promise<Domain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching seller domains:', error);
      return [];
    }
    
    return data.map(enhancedConvertDbDomainToDomain);
  } catch (error) {
    console.error('Error in getDomainsBySeller:', error);
    return [];
  }
};

// Get available domains by seller ID
export const getAvailableDomainsBySeller = async (sellerId: string): Promise<Domain[]> => {
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('seller_id', sellerId)
      .is('buyer_id', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching available seller domains:', error);
      return [];
    }
    
    return data.map(enhancedConvertDbDomainToDomain);
  } catch (error) {
    console.error('Error in getAvailableDomainsBySeller:', error);
    return [];
  }
};

// Get domain by ID
export const getDomainById = async (id: string): Promise<Domain | undefined> => {
  try {
    const domain = await fetchDomainById(id);
    
    if (!domain) {
      return undefined;
    }
    
    return enhancedConvertDbDomainToDomain(domain);
  } catch (error) {
    console.error('Error in getDomainById:', error);
    return undefined;
  }
};

// Add a new domain
export const addDomain = async (domainData: {
  name: string;
  expirationDate: Date;
  description: string;
  sellerId: string;
  sellerName: string;
  category: DomainCategory;
  price?: number;
}): Promise<Domain | null> => {
  try {
    const tld = extractTLD(domainData.name) || "";
    
    const { data, error } = await supabase
      .from('domains')
      .insert({
        name: domainData.name,
        description: domainData.description,
        expiration_date: domainData.expirationDate.toISOString(),
        seller_id: domainData.sellerId,
        seller_name: domainData.sellerName,
        likes: 0,
        price: 99, // Fixed price at $99
        is_sponsored: false,
        is_admin_pick: false,
        created_at: new Date().toISOString(),
        category: domainData.category,
        tld,
        verification_status: VerificationStatus.NOT_STARTED,
        is_verified: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding domain:', error);
      return null;
    }
    
    return enhancedConvertDbDomainToDomain(data);
  } catch (error) {
    console.error('Error in addDomain:', error);
    return null;
  }
};

// Delete a domain
export const deleteDomain = async (domainId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('domains')
      .delete()
      .eq('id', domainId);
    
    if (error) {
      console.error('Error deleting domain:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteDomain:', error);
    return false;
  }
};

// Update domain verification
export const updateDomainVerificationStatus = async (
  domainId: string,
  status: VerificationStatus,
  method?: VerificationMethod,
  notes?: string,
  verificationCode?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      verification_status: status,
      verification_date: new Date().toISOString(),
      is_verified: status === VerificationStatus.VERIFIED,
    };

    if (method) {
      updateData.verification_method = method;
    }

    if (notes) {
      updateData.verification_notes = notes;
    }

    if (verificationCode) {
      updateData.verification_code = verificationCode;
    }

    return await updateDomainVerification(domainId, updateData);
  } catch (error) {
    console.error('Error in updateDomainVerificationStatus:', error);
    return false;
  }
};

// Update domain general information
export const updateDomain = async (updatedDomain: Domain): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('domains')
      .update({
        name: updatedDomain.name,
        description: updatedDomain.description,
        expiration_date: updatedDomain.expirationDate.toISOString(),
        price: updatedDomain.price,
        category: updatedDomain.category,
        is_sponsored: updatedDomain.isSponsored,
        is_admin_pick: updatedDomain.isAdminPick,
      })
      .eq('id', updatedDomain.id);
    
    if (error) {
      console.error('Error updating domain:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateDomain:', error);
    return false;
  }
};
