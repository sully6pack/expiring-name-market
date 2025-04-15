
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Domain, DomainCategory, VerificationStatus } from "@/types";
import { isDomainValid } from "@/utils/validation";
import { extractTLD } from "@/utils/domainUtils";
import { supabase } from "@/integrations/supabase/client";
import { validateDomainCategory, validateVerificationStatus } from "@/utils/domainValidation";

interface DomainSubmitData {
  domainName: string;
  description: string;
  expirationDate: Date | undefined;
  category: DomainCategory;
}

export const useDashboardDomains = (userId: string | undefined) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myDomains, setMyDomains] = useState<Domain[]>([]);
  const [interestedBuyers, setInterestedBuyers] = useState<{ domainId: string; buyerName: string; email: string }[]>([]);
  const navigate = useNavigate();

  const fetchUserDomains = async (userId: string | undefined) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching domains:", error);
        toast.error("Failed to load your domains");
        return;
      }
      
      // Convert database format to app format
      const formattedDomains: Domain[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        expirationDate: new Date(item.expiration_date),
        sellerId: item.seller_id,
        sellerName: item.seller_name,
        likes: item.likes || 0,
        price: item.price,
        isSponsored: item.is_sponsored || false,
        isAdminPick: item.is_admin_pick || false,
        createdAt: new Date(item.created_at),
        category: validateDomainCategory(item.category),
        tld: item.tld,
        verificationStatus: validateVerificationStatus(item.verification_status),
        isVerified: item.is_verified || false
      }));
      
      setMyDomains(formattedDomains);
      console.log(`Loaded ${formattedDomains.length} domains from Supabase`);
      
      // For demo purposes, set some interested buyers
      if (formattedDomains.length > 0) {
        setInterestedBuyers([
          { 
            domainId: formattedDomains[0]?.id || "domain1", 
            buyerName: "John Doe", 
            email: "john@example.com" 
          },
          { 
            domainId: formattedDomains.length > 1 ? formattedDomains[1].id : "domain2", 
            buyerName: "Alice Williams", 
            email: "alice@example.com" 
          },
        ]);
      }
    } catch (error) {
      console.error("Error in fetchUserDomains:", error);
      toast.error("An unexpected error occurred while loading domains");
    }
  };

  const handleSubmitDomain = async (domainData: DomainSubmitData) => {
    setIsSubmitting(true);

    // Only validate expiration date if one was provided
    if (domainData.expirationDate && !isDomainValid(domainData.expirationDate)) {
      toast.error("Domain must be expiring within the next 90 days and not more than 15 days past expiration");
      setIsSubmitting(false);
      return;
    }

    const tld = extractTLD(domainData.domainName);
    
    if (!tld) {
      toast.error("Please enter a valid domain name with a TLD (e.g., .com, .org, .io)");
      setIsSubmitting(false);
      return;
    }
    
    if (!userId) {
      toast.error("You must be logged in to list a domain");
      setIsSubmitting(false);
      return;
    }

    try {
      // Set a default expiration date if one wasn't provided
      const expirationDate = domainData.expirationDate || (() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 3); // Default to 3 months from now
        return date;
      })();
      
      // Insert domain into Supabase - Set is_verified to true
      const { data, error } = await supabase
        .from('domains')
        .insert({
          name: domainData.domainName,
          description: domainData.description,
          expiration_date: expirationDate.toISOString(),
          seller_id: userId,
          seller_name: userId, // This will be replaced with user's name
          price: 99.00, // Fixed price
          category: domainData.category,
          tld: tld,
          verification_status: VerificationStatus.VERIFIED, // Set as VERIFIED immediately
          is_verified: true // Set to true so it appears in Browse Domains
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error saving domain:", error);
        toast.error(error.message || "Failed to save domain");
        setIsSubmitting(false);
        return;
      }
      
      // Convert to our Domain type
      const newDomain: Domain = {
        id: data.id,
        name: data.name,
        description: data.description,
        expirationDate: new Date(data.expiration_date),
        sellerId: data.seller_id,
        sellerName: data.seller_name,
        likes: data.likes || 0,
        price: data.price,
        isSponsored: data.is_sponsored || false,
        isAdminPick: data.is_admin_pick || false,
        createdAt: new Date(data.created_at),
        category: validateDomainCategory(data.category),
        tld: data.tld,
        verificationStatus: validateVerificationStatus(data.verification_status),
        isVerified: data.is_verified || false
      };
      
      // Update local state
      setMyDomains(prevDomains => [newDomain, ...prevDomains]);
      
      toast.success(`${domainData.domainName} has been successfully listed`);
      
      // Navigate to the Domains page to view the newly added domain
      setTimeout(() => {
        navigate('/domains');
      }, 2000);
    } catch (error: any) {
      console.error("Error in handleSubmitDomain:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDomain = async (domainToDelete: Domain) => {
    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainToDelete.id);
      
      if (error) {
        console.error("Error deleting domain:", error);
        toast.error(error.message || `Failed to remove ${domainToDelete.name}`);
        return;
      }
      
      // Update local state
      setMyDomains(prevDomains => prevDomains.filter(domain => domain.id !== domainToDelete.id));
      
      toast.success(`${domainToDelete.name} has been removed from your listings`);
    } catch (error) {
      console.error("Error in handleDeleteDomain:", error);
      toast.error(`Failed to remove ${domainToDelete.name}. Please try again.`);
    }
  };

  // Initial load of domains
  useEffect(() => {
    if (userId) {
      fetchUserDomains(userId);
    }
  }, [userId]);

  return {
    isSubmitting,
    myDomains,
    interestedBuyers,
    handleSubmitDomain,
    handleDeleteDomain
  };
};
