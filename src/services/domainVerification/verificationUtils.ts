
import { Domain } from "@/types";
import { supabase } from "@/lib/supabase";

// Generate a random verification code for DNS or email verification
export const generateVerificationCode = (): string => {
  return `verify-${Math.random().toString(36).substring(2, 10)}`;
};

// Fetch domain expiration date using WhoisXML API
export const fetchDomainExpirationDate = async (domainName: string): Promise<Date | null> => {
  console.log(`[VERIFICATION] Fetching expiration date for ${domainName}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'getExpirationDate',
        domain: domainName
      }
    });

    if (error) {
      console.error('Error invoking domain-verification function:', error);
      return null;
    }

    if (!data.success) {
      console.error('Error fetching expiration date:', data.error);
      return null;
    }

    if (data.expirationDate) {
      console.log(`[VERIFICATION] Fetched expiration date: ${data.expirationDate}`);
      return new Date(data.expirationDate);
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchDomainExpirationDate:', error);
    return null;
  }
};

// Get WHOIS email for domain verification
export const getWhoisEmail = async (domain: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('domain-verification', {
      body: {
        action: 'getWhoisEmail',
        domain
      }
    });

    if (error) {
      console.error('Error invoking domain-verification function:', error);
      return null;
    }

    if (!data.success) {
      console.error('Error fetching WHOIS email:', data.error);
      return null;
    }

    return data.email;
  } catch (error) {
    console.error('Error in getWhoisEmail:', error);
    return null;
  }
};
