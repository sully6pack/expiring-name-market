
import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { mockDomains } from "@/lib/mockData";
import { Domain } from "@/types";
import { getUniqueTLDs } from "@/utils/domainUtils";
import { filterValidDomains } from "@/utils/validation";
import { filterOutPurchasedDomains } from "@/utils/purchaseUtils";
import { toast } from "sonner";
import DomainsList from "@/components/domains/DomainsList";
import DomainFilters from "@/components/domains/DomainFilters";
import DomainsPagination from "@/components/domains/DomainsPagination";

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
  
  const domainsPerPage = 20;

  useEffect(() => {
    // Load domains directly from mockDomains
    console.log("Domains page: Loading domains from mockDomains");
    
    const validDomains = filterValidDomains([...mockDomains]);
    
    // Filter out purchased domains
    const availableDomains = filterOutPurchasedDomains(validDomains);
    
    console.log("Domains page: Valid domains count:", availableDomains.length);
    
    setDomains(availableDomains);
    setFilteredDomains(availableDomains);
    setAvailableTLDs(getUniqueTLDs(availableDomains));
    
    if (availableDomains.length > 0) {
      toast.success(`Loaded ${availableDomains.length} domains`);
    } else {
      toast.error("Failed to load any domains");
    }
  }, []);

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
