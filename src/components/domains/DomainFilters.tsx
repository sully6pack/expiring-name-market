
import { useState, useEffect } from "react";
import { DomainCategory } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DomainFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  tldFilter: string;
  setTldFilter: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  availableTLDs: string[];
  onSearch: (e: React.FormEvent) => void;
}

const DomainFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  tldFilter,
  setTldFilter,
  sortOrder,
  setSortOrder,
  availableTLDs,
  onSearch
}: DomainFiltersProps) => {
  return (
    <div className="mb-8">
      <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-4">
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
  );
};

export default DomainFilters;
