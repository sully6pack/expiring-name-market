
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Domain, LeaderboardType } from "@/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Tag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import DomainCheckout from "./DomainCheckout";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardProps {
  title: string;
  type: LeaderboardType;
  domains: Domain[];
}

const Leaderboard = ({ title, type, domains }: LeaderboardProps) => {
  const [likedDomains, setLikedDomains] = useState<Record<string, boolean>>({});
  const [domainLikes, setDomainLikes] = useState<Record<string, number>>({});
  const [checkoutDomain, setCheckoutDomain] = useState<Domain | null>(null);

  const handleLike = async (domain: Domain) => {
    try {
      const isCurrentlyLiked = likedDomains[domain.id] || false;
      const newLikedState = !isCurrentlyLiked;
      
      // Update likes in the database
      const currentLikes = domainLikes[domain.id] || domain.likes;
      const newLikes = newLikedState ? currentLikes + 1 : currentLikes - 1;
      
      const { error } = await supabase
        .from('domains')
        .update({ likes: newLikes })
        .eq('id', domain.id);
        
      if (error) throw error;
      
      // Update UI state
      setLikedDomains({
        ...likedDomains,
        [domain.id]: newLikedState
      });
      
      setDomainLikes({
        ...domainLikes,
        [domain.id]: newLikes
      });
      
      if (newLikedState) {
        toast.success(`You liked ${domain.name}`);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Failed to update likes. Please try again.");
    }
  };

  const handleBuy = (domain: Domain) => {
    setCheckoutDomain(domain);
  };

  const getDisplayedLikes = (domain: Domain) => {
    return domainLikes[domain.id] !== undefined ? domainLikes[domain.id] : domain.likes;
  };

  return (
    <>
      <Card className="w-full shadow-md">
        <CardHeader className="bg-gradient-to-r from-brand-blue to-brand-skyBlue text-white py-3">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 gap-2">
            {domains.length > 0 ? (
              domains.map((domain) => (
                <div key={domain.id} className="border-b pb-2 last:border-b-0 last:pb-0 flex flex-col">
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
                      <button 
                        onClick={() => handleLike(domain)}
                        className="flex items-center gap-1 text-xs bg-transparent border-0 cursor-pointer p-0 hover:text-red-500"
                      >
                        <Heart 
                          size={12} 
                          className={likedDomains[domain.id] ? "text-red-500 fill-red-500" : "text-red-500"} 
                        />
                        {getDisplayedLikes(domain)}
                      </button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 p-1 flex items-center gap-1 text-xs"
                        onClick={() => handleBuy(domain)}
                      >
                        <ShoppingCart size={12} />
                        Buy
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No domains available</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {checkoutDomain && (
        <DomainCheckout 
          domain={checkoutDomain} 
          isOpen={!!checkoutDomain} 
          onClose={() => setCheckoutDomain(null)} 
        />
      )}
    </>
  );
};

export default Leaderboard;
