
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationNext, 
  PaginationPrevious, 
  PaginationLink 
} from "@/components/ui/pagination";
import Navbar from "@/components/Navbar";
import DomainCard from "@/components/DomainCard";
import { mockDomains } from "@/lib/mockData";
import { Domain, DomainCategory } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUniqueTLDs } from "@/utils/domainUtils";
import { filterValidDomains } from "@/utils/validation";
import { toast } from "sonner";

const Domains = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(queryParams.get("search") || "");
  const [sortOrder, setSortOrder] = useState<string>("expiration-asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tldFilter, setTldFilter] = useState<string>(queryParams.get("tld") || "all");
  const [availableTLDs, setAvailableTLDs] = useState<string[]>([]);
  
  const domainsPerPage = 20;

  useEffect(() => {
    // Load domains directly from mockDomains
    console.log("Domains page: Loading domains from mockDomains");
    
    const validDomains = filterValidDomains([...mockDomains]);
    console.log("Domains page: Valid domains count:", validDomains.length);
    
    setDomains(validDomains);
    setFilteredDomains(validDomains);
    setAvailableTLDs(getUniqueTLDs(validDomains));
    
    if (validDomains.length > 0) {
      toast.success(`Loaded ${validDomains.length} domains`);
    } else {
      toast.error("Failed to load any domains");
    }
  }, []);

  // Parse URL parameters when the location changes
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("search");
    const tldParam = queryParams.get("tld");
    
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
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.append("search", searchTerm);
    if (tldFilter !== "all") searchParams.append("tld", tldFilter);
    
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Domains</h1>
        
        {/* Search and filter */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(DomainCategory).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={tldFilter} onValueChange={setTldFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="TLD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All TLDs</SelectItem>
                  {availableTLDs.map((tld) => (
                    <SelectItem key={tld} value={tld}>
                      {tld}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiration-asc">Expiration (Soon First)</SelectItem>
                  <SelectItem value="expiration-desc">Expiration (Later First)</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical (A-Z)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        
        {/* Domain listings */}
        {currentDomains.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentDomains.map((domain) => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No domains found matching your search criteria.</p>
          </div>
        )}
        
        {/* Pagination */}
        {filteredDomains.length > domainsPerPage && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (currentPage > totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  
                  return (
                    pageNum > 0 && pageNum <= totalPages && (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          isActive={pageNum === currentPage}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Domains;
