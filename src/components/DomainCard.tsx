
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Domain } from "@/types";
import { formatDate, getDaysUntilExpiration } from "@/utils/validation";
import { Heart, Tag } from "lucide-react";
import DomainCheckout from "./DomainCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useDomainLike } from "@/hooks/useDomainLike";

interface DomainCardProps {
  domain: Domain;
  showExpiration?: boolean;
}

const DomainCard = ({ domain, showExpiration = true }: DomainCardProps) => {
  const { appUser } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { likes, isLiked, toggleLike, isLoading } = useDomainLike(domain);

  const handleBuy = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Card className="domain-card h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl break-all">{domain.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
              {domain.isSponsored && (
                <Badge variant="outline" className="bg-brand-orange text-white">
                  Sponsored
                </Badge>
              )}
              {domain.isAdminPick && (
                <Badge variant="outline" className="bg-brand-blue text-white">
                  Staff Pick
                </Badge>
              )}
              {domain.tld && (
                <Badge variant="secondary" className="bg-gray-200 text-gray-800">
                  .{domain.tld}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-2">
          <p className="text-muted-foreground mb-4">{domain.description}</p>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
              <Tag size={14} />
              {domain.category.charAt(0).toUpperCase() + domain.category.slice(1)}
            </Badge>
          </div>
          {showExpiration && (
            <div className="mb-4">
              <p className="text-sm">
                <span className="font-semibold">Expiration:</span>{" "}
                {formatDate(domain.expirationDate)}
              </p>
              <p className="text-sm text-amber-600 font-medium">
                {getDaysUntilExpiration(domain.expirationDate)}
              </p>
            </div>
          )}
          <p className="text-lg font-bold">${domain.price}</p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={toggleLike}
              disabled={!appUser || isLoading}
              aria-label={isLiked ? "Unlike" : "Like"}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart
                className={isLiked ? "fill-red-500 text-red-500" : ""}
                size={18}
              />
              <span>{likes}</span>
            </Button>
          </div>
          <Button onClick={handleBuy}>Buy Now</Button>
        </CardFooter>
      </Card>
      
      <DomainCheckout 
        domain={domain} 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
};

export default DomainCard;
