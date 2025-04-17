
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Domain } from "@/types";

export function useDomainLike(domain: Domain) {
  const { appUser } = useAuth();
  const [likes, setLikes] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch current like status and count when component mounts
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!appUser || !domain.id) {
        setIsLiked(false);
        setLikes(domain.likes || 0);
        return;
      }

      setIsLoading(true);
      try {
        // Check if user has liked this domain
        const { data: likeData, error: likeError } = await supabase
          .from('domain_likes')
          .select('*')
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id)
          .single();

        // Fetch current likes count
        const { data: domainData, error: domainError } = await supabase
          .from('domains')
          .select('likes')
          .eq('id', domain.id)
          .single();

        if (likeError && likeError.code !== 'PGRST116') {
          console.error("Error checking like status:", likeError);
        }

        if (domainError) {
          console.error("Error fetching domain likes:", domainError);
        }

        setIsLiked(!!likeData);
        setLikes(domainData?.likes || 0);
      } catch (error) {
        console.error("Error in fetchLikeStatus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeStatus();
  }, [appUser, domain.id]);

  const toggleLike = async () => {
    if (!appUser) {
      toast.error("Please sign in to like domains");
      return;
    }

    if (!domain.id) {
      console.error("Cannot like domain without ID");
      return;
    }

    setIsLoading(true);

    try {
      if (!isLiked) {
        // Add like
        const { error: likeError } = await supabase
          .from('domain_likes')
          .insert({ 
            domain_id: domain.id, 
            user_id: appUser.id 
          });
          
        if (likeError) {
          console.error("Error adding like:", likeError);
          toast.error("Failed to like domain");
          setIsLoading(false);
          return;
        }
        
        setIsLiked(true);
        setLikes(prev => prev + 1);
        toast.success(`You liked ${domain.name}`);
      } else {
        // Remove like
        const { error: unlikeError } = await supabase
          .from('domain_likes')
          .delete()
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id);
          
        if (unlikeError) {
          console.error("Error removing like:", unlikeError);
          toast.error("Failed to unlike domain");
          setIsLoading(false);
          return;
        }
        
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
        toast.success(`You unliked ${domain.name}`);
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Failed to update likes");
    } finally {
      setIsLoading(false);
    }
  };

  return { likes, isLiked, toggleLike, isLoading };
}
