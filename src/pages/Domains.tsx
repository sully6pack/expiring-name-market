
import { useState, useEffect } from "react";
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

const Domains = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<string>("expiration-asc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tldFilter, setTldFilter] = useState<string>("all");
  const [availableTLDs, setAvailableTLDs] = useState<string[]>([]);
  
  const domainsPerPage = 8;

  useEffect(() => {
    // Use the global domains array if it exists, otherwise use mockDomains
    const allDomains = window.globalDomains || mockDomains;
    setDomains(allDomains);
    setFilteredDomains(allDomains);
    
    // Get available TLDs
    setAvailableTLDs(getUniqueTLDs(allDomains));
  }, []);

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
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        case "expiration-desc":
          return new Date(b.expirationDate).getTime() - new Date(a.expirationDate).getTime();
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
    // The filtering is handled by the useEffect
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
        {filteredDomains.length > 0 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
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
