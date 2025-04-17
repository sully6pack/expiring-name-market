
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DomainsList from "@/components/domains/DomainsList";
import DomainFilters from "@/components/domains/DomainFilters";
import DomainsPagination from "@/components/domains/DomainsPagination";
import { useDomainsList } from "@/hooks/useDomainsList";
import { usePagination } from "@/hooks/usePagination";

const Domains = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCondensed, setIsCondensed] = useState<boolean>(false);
  
  const { domains, isLoading, filters } = useDomainsList();
  const { 
    paginatedItems: currentDomains,
    currentPage,
    setCurrentPage,
    totalPages
  } = usePagination({ 
    items: domains,
    itemsPerPage: 20
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    if (filters.searchTerm) newParams.append("search", filters.searchTerm);
    if (filters.tldFilter !== "all") newParams.append("tld", filters.tldFilter);
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Domains</h1>
        
        <DomainFilters
          searchTerm={filters.searchTerm}
          setSearchTerm={filters.setSearchTerm}
          categoryFilter={filters.categoryFilter}
          setCategoryFilter={filters.setCategoryFilter}
          tldFilter={filters.tldFilter}
          setTldFilter={filters.setTldFilter}
          sortOrder={filters.sortOrder}
          setSortOrder={filters.setSortOrder}
          availableTLDs={filters.availableTLDs}
          onSearch={handleSearch}
          isCondensed={isCondensed}
          setIsCondensed={setIsCondensed}
        />
        
        <DomainsList 
          domains={currentDomains}
          isCondensed={isCondensed}
          isLoading={isLoading}
        />
        
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
