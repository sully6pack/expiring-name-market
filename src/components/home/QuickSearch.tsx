
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface QuickSearchProps {
  availableTLDs: string[];
}

const QuickSearch = ({ availableTLDs }: QuickSearchProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tldFilter, setTldFilter] = useState<string>("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create URL search parameters for the search terms
    const searchParams = new URLSearchParams();
    if (searchTerm) searchParams.append("search", searchTerm);
    if (tldFilter !== "all") searchParams.append("tld", tldFilter);
    
    // Navigate to domains page with search parameters
    navigate(`/domains?${searchParams.toString()}`);
  };

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Quick Search</h2>
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
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuickSearch;
