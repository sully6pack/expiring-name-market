
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Domain, LeaderboardType } from "@/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Tag, ShoppingCart } from "lucide-react";
import DomainCheckout from "./DomainCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useDomainLike } from "@/hooks/useDomainLike";

interface LeaderboardProps {
  title: string;
  type: LeaderboardType;
  domains: Domain[];
}

const LeaderboardItem = ({ domain }: { domain: Domain }) => {
  const { appUser } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { likes, isLiked, toggleLike, isLoading } = useDomainLike(domain);

  return (
    <>
      <div className="border-b pb-2 last:border-b-0 last:pb-0 flex flex-col">
        <div className="flex justify-between items-center">
          <div className="font-medium text-base break-all mr-2">{domain.name}</div>
          <div className="text-sm font-bold">${domain.price}</div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Tag size={12} />
            {domain.category}
            {domain.tld && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs py-0 h-5">
                .{domain.tld}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              size="sm"
              onClick={toggleLike}
              disabled={!appUser || isLoading}
              className="flex items-center gap-1 text-xs h-6 p-1"
              aria-label={isLiked ? "Unlike" : "Like"}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart 
                size={12} 
                className={isLiked ? "text-red-500 fill-red-500" : "text-gray-500"} 
              />
              <span>{likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 p-1 flex items-center gap-1 text-xs"
              onClick={() => setCheckoutOpen(true)}
            >
              <ShoppingCart size={12} />
              Buy
            </Button>
          </div>
        </div>
      </div>
      {checkoutOpen && (
        <DomainCheckout 
          domain={domain} 
          isOpen={checkoutOpen} 
          onClose={() => setCheckoutOpen(false)} 
        />
      )}
    </>
  );
};

const Leaderboard = ({ title, type, domains }: LeaderboardProps) => {
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-skyBlue text-white py-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 gap-2">
          {domains.length > 0 ? (
            domains.map((domain) => (
              <LeaderboardItem key={domain.id} domain={domain} />
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No domains available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
