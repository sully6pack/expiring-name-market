
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ListFilter, LayoutGrid } from "lucide-react";

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
  isCondensed: boolean;
  setIsCondensed: (value: boolean) => void;
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
  onSearch,
  isCondensed,
  setIsCondensed
}: DomainFiltersProps) => {
  return (
    <div className="mb-8 space-y-4">
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
      
      <div className="flex items-center justify-end space-x-2 mt-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="text-gray-500" size={18} />
          <Switch
            id="condensed-view"
            checked={isCondensed}
            onCheckedChange={setIsCondensed}
          />
          <Label htmlFor="condensed-view" className="flex items-center gap-2 cursor-pointer">
            <ListFilter className="text-gray-500" size={18} />
            <span className="text-sm">Condensed View</span>
          </Label>
        </div>
      </div>
    </div>
  );
};

export default DomainFilters;
