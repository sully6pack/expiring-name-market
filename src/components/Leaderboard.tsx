import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Domain, LeaderboardType } from "@/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Heart, Tag, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import DomainCheckout from "./DomainCheckout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardProps {
  title: string;
  type: LeaderboardType;
  domains: Domain[];
}

const Leaderboard = ({ title, type, domains }: LeaderboardProps) => {
  const { appUser } = useAuth();
  const [likedDomains, setLikedDomains] = useState<Record<string, boolean>>({});
  const [domainLikes, setDomainLikes] = useState<Record<string, number>>({});
  const [checkoutDomain, setCheckoutDomain] = useState<Domain | null>(null);

  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!appUser) return;

      try {
        const { data: likedData, error } = await supabase
          .from('domain_likes')
          .select('domain_id')
          .eq('user_id', appUser.id)
          .in('domain_id', domains.map(d => d.id));

        if (error) {
          console.error("Error checking liked domains:", error);
          return;
        }

        const likedDomainIds = likedData.map(item => item.domain_id);
        const likedStatus = domains.reduce((acc, domain) => {
          acc[domain.id] = likedDomainIds.includes(domain.id);
          return acc;
        }, {});

        setLikedDomains(likedStatus);
      } catch (error) {
        console.error("Error in checkLikedStatus:", error);
      }
    };

    checkLikedStatus();
  }, [appUser, domains]);

  const handleLike = async (domain: Domain) => {
    if (!appUser) {
      toast.error("Please sign in to like domains");
      return;
    }

    try {
      const isCurrentlyLiked = likedDomains[domain.id] || false;
      const currentLikes = domainLikes[domain.id] || domain.likes;

      if (!isCurrentlyLiked) {
        const { error: likeError } = await supabase
          .from('domain_likes')
          .insert({ 
            domain_id: domain.id, 
            user_id: appUser.id 
          });
          
        if (likeError) throw likeError;

        const { error: updateError } = await supabase
          .from('domains')
          .update({ likes: currentLikes + 1 })
          .eq('id', domain.id);
          
        if (updateError) throw updateError;

        setLikedDomains({
          ...likedDomains,
          [domain.id]: true
        });

        setDomainLikes({
          ...domainLikes,
          [domain.id]: currentLikes + 1
        });

        toast.success(`You liked ${domain.name}`);
      } else {
        const { error: unlikeError } = await supabase
          .from('domain_likes')
          .delete()
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id);
          
        if (unlikeError) throw unlikeError;

        const { error: updateError } = await supabase
          .from('domains')
          .update({ likes: currentLikes - 1 })
          .eq('id', domain.id);
          
        if (updateError) throw updateError;

        setLikedDomains({
          ...likedDomains,
          [domain.id]: false
        });

        setDomainLikes({
          ...domainLikes,
          [domain.id]: currentLikes - 1
        });
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Failed to update likes. Please try again.");
    }
  };

  const getDisplayedLikes = (domain: Domain) => {
    return domainLikes[domain.id] !== undefined ? domainLikes[domain.id] : domain.likes;
  };

  const handleBuy = (domain: Domain) => {
    setCheckoutDomain(domain);
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
                        disabled={!appUser}
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
