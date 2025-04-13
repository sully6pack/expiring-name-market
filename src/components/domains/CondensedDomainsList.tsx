
import { Domain } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDaysUntilExpiration } from "@/utils/validation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface CondensedDomainsListProps {
  domains: Domain[];
  isLoading?: boolean;
}

const CondensedDomainsList = ({ domains, isLoading }: CondensedDomainsListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">Loading domains...</p>
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No domains found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {domains.map((domain) => (
        <div 
          key={domain.id} 
          className="flex items-center justify-between bg-white p-3 rounded-md border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 flex-grow">
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-lg truncate">{domain.name}</h3>
                <div className="flex flex-wrap gap-1">
                  {domain.isSponsored && (
                    <Badge variant="outline" className="bg-brand-orange text-white text-xs">
                      Sponsored
                    </Badge>
                  )}
                  {domain.isAdminPick && (
                    <Badge variant="outline" className="bg-brand-blue text-white text-xs">
                      Staff Pick
                    </Badge>
                  )}
                  {domain.tld && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-800 text-xs">
                      .{domain.tld}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
                  <Tag size={12} />
                  {domain.category.charAt(0).toUpperCase() + domain.category.slice(1)}
                </Badge>
                <span className="mx-1">•</span>
                <span className="text-amber-600 font-medium">
                  {getDaysUntilExpiration(domain.expirationDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">${domain.price}</span>
            <Link to={`/domains/${domain.id}`}>
              <Button size="sm">Buy Now</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CondensedDomainsList;
