
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Domain, DomainCategory, VerificationStatus } from "@/types";
import { getUniqueTLDs } from "@/utils/domainUtils";
import { filterValidDomains } from "@/utils/validation";
import { toast } from "sonner";
import DomainsList from "@/components/domains/DomainsList";
import DomainFilters from "@/components/domains/DomainFilters";
import DomainsPagination from "@/components/domains/DomainsPagination";
import { supabase } from "@/integrations/supabase/client";
import { seedInitialDomains } from "@/services/seedDomains";

const Domains = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [sortOrder, setSortOrder] = useState<string>("expiration-asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tldFilter, setTldFilter] = useState<string>(searchParams.get("tld") || "all");
  const [availableTLDs, setAvailableTLDs] = useState<string[]>([]);
  const [isCondensed, setIsCondensed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const domainsPerPage = 20;

  useEffect(() => {
    const fetchDomains = async () => {
      setIsLoading(true);
      try {
        // Seed domains if needed
        await seedInitialDomains();
        
        // Fetch verified domains from Supabase (those available for purchase)
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
        
        // Convert database format to app format with proper enum conversion
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
          // Convert string category to DomainCategory enum
          category: validateDomainCategory(item.category),
          tld: item.tld,
          verificationStatus: validateVerificationStatus(item.verification_status),
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
    
    fetchDomains();
  }, [location.pathname]); // Reload whenever the path changes to refresh domains

  // Helper function to validate and convert category string to DomainCategory enum
  const validateDomainCategory = (category: string): DomainCategory => {
    if (Object.values(DomainCategory).includes(category as DomainCategory)) {
      return category as DomainCategory;
    }
    return DomainCategory.Other; // Default to "Other" if category is not valid
  };

  // Helper function to validate and convert verification status string to VerificationStatus enum
  const validateVerificationStatus = (status: string): VerificationStatus => {
    if (Object.values(VerificationStatus).includes(status as VerificationStatus)) {
      return status as VerificationStatus;
    }
    return VerificationStatus.NOT_STARTED; // Default if not valid
  };

  // Parse URL parameters when the location changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get("search");
    const tldParam = params.get("tld");
    
    if (searchParam) setSearchTerm(searchParam);
    if (tldParam) setTldFilter(tldParam);
  }, [location]);

  useEffect(() => {
    let result = [...domains];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(domain => 
        domain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        domain.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(domain => domain.category === categoryFilter);
    }
    
    // Apply TLD filter
    if (tldFilter !== "all") {
      result = result.filter(domain => domain.tld === tldFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
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
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [domains, searchTerm, sortOrder, categoryFilter, tldFilter]);

  // Calculate pagination
  const indexOfLastDomain = currentPage * domainsPerPage;
  const indexOfFirstDomain = indexOfLastDomain - domainsPerPage;
  const currentDomains = filteredDomains.slice(indexOfFirstDomain, indexOfLastDomain);
  const totalPages = Math.ceil(filteredDomains.length / domainsPerPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search parameters without redirecting
    const newParams = new URLSearchParams();
    if (searchTerm) newParams.append("search", searchTerm);
    if (tldFilter !== "all") newParams.append("tld", tldFilter);
    
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Domains</h1>
        
        {/* Search and filter */}
        <DomainFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter} 
          setCategoryFilter={setCategoryFilter}
          tldFilter={tldFilter}
          setTldFilter={setTldFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          availableTLDs={availableTLDs}
          onSearch={handleSearch}
          isCondensed={isCondensed}
          setIsCondensed={setIsCondensed}
        />
        
        {/* Domain listings */}
        <DomainsList 
          domains={currentDomains} 
          isCondensed={isCondensed} 
          isLoading={isLoading}
        />
        
        {/* Pagination */}
        <DomainsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default Domains;
