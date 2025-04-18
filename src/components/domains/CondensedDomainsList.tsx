
import { Domain } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDate, getDaysUntilExpiration } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Heart, Tag } from "lucide-react";
import DomainCheckout from "@/components/DomainCheckout";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDomainLike } from "@/hooks/useDomainLike";

interface CondensedDomainsListProps {
  domains: Domain[];
  isLoading?: boolean;
}

const CondensedDomainsList = ({ domains, isLoading }: CondensedDomainsListProps) => {
  const { appUser } = useAuth();
  const [checkoutDomain, setCheckoutDomain] = useState<Domain | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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

  const handleBuy = (domain: Domain) => {
    setCheckoutDomain(domain);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <div className="space-y-2">
        {domains.map((domain) => {
          const { likes, isLiked, toggleLike, isLoading: isLikeLoading } = useDomainLike(domain);
          
          return (
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={toggleLike}
                    disabled={!appUser || isLikeLoading}
                    aria-label={isLiked ? "Unlike" : "Like"}
                    title={isLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      className={isLiked ? "fill-red-500 text-red-500" : ""}
                      size={18}
                    />
                    <span>{likes}</span>
                  </Button>
                  <Button size="sm" onClick={() => handleBuy(domain)}>Buy Now</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {checkoutDomain && (
        <DomainCheckout 
          domain={checkoutDomain} 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
        />
      )}
    </>
  );
};

export default CondensedDomainsList;
