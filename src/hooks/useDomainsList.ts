
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Domain, DomainCategory } from "@/types";
import { getUniqueTLDs } from "@/utils/domainUtils";
import { filterValidDomains } from "@/utils/validation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Update to use the same Supabase client
import { seedInitialDomains } from "@/services/seedDomains";

export const useDomainsList = () => {
  const [searchParams] = useSearchParams();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [availableTLDs, setAvailableTLDs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortOrder, setSortOrder] = useState<string>("expiration-asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tldFilter, setTldFilter] = useState<string>(searchParams.get("tld") || "all");

  const validateDomainCategory = (category: string): DomainCategory => {
    if (Object.values(DomainCategory).includes(category as DomainCategory)) {
      return category as DomainCategory;
    }
    return DomainCategory.Other;
  };

  const fetchDomains = async () => {
    setIsLoading(true);
    try {
      await seedInitialDomains();
      
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('is_verified', true)
        .is('buyer_id', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching domains:", error);
        toast.error("Failed to load domains");
        setIsLoading(false);
        return;
      }
      
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
        verificationStatus: item.verification_status as any,
        isVerified: item.is_verified || false
      }));
      
      const validDomains = filterValidDomains(formattedDomains);
      
      setDomains(validDomains);
      setFilteredDomains(validDomains);
      setAvailableTLDs(getUniqueTLDs(validDomains));
      
      if (validDomains.length > 0) {
        toast.success(`Loaded ${validDomains.length} domains`);
      } else {
        toast.info("No domains available at the moment");
      }
    } catch (error) {
      console.error("Error in fetchDomains:", error);
      toast.error("An unexpected error occurred while loading domains");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    let result = [...domains];
    
    if (searchTerm) {
      result = result.filter(domain => 
        domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== "all") {
      result = result.filter(domain => domain.category === categoryFilter);
    }
    
    if (tldFilter !== "all") {
      result = result.filter(domain => domain.tld === tldFilter);
    }
    
    result.sort((a, b) => {
      if (a.isSponsored && !b.isSponsored) return -1;
      if (!a.isSponsored && b.isSponsored) return 1;
      
      switch (sortOrder) {
        case "expiration-asc":
          return a.expirationDate.getTime() - b.expirationDate.getTime();
        case "expiration-desc":
          return b.expirationDate.getTime() - a.expirationDate.getTime();
        case "popularity":
          return b.likes - a.likes;
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
    
    setFilteredDomains(result);
  }, [domains, searchTerm, sortOrder, categoryFilter, tldFilter]);

  return {
    domains: filteredDomains,
    isLoading,
    filters: {
      searchTerm,
      setSearchTerm,
      sortOrder,
      setSortOrder,
      categoryFilter,
      setCategoryFilter,
      tldFilter,
      setTldFilter,
      availableTLDs
    }
  };
};
