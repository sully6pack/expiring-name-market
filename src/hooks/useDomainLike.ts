
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Domain } from "@/types";

export function useDomainLike(domain: Domain) {
  const { appUser } = useAuth();
  const [likes, setLikes] = useState<number>(domain.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch current like status and count when component mounts or domain/user changes
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

        // Handle not found case gracefully
        if (likeError && likeError.code !== 'PGRST116') {
          console.error("Error checking like status:", likeError);
        }

        // Fetch current likes count
        const { data: domainData, error: domainError } = await supabase
          .from('domains')
          .select('likes')
          .eq('id', domain.id)
          .single();

        if (domainError) {
          console.error("Error fetching domain likes:", domainError);
        } else if (domainData && typeof domainData.likes === 'number') {
          setLikes(domainData.likes);
        }

        // Update liked state
        setIsLiked(!!likeData);
      } catch (error) {
        console.error("Error in fetchLikeStatus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeStatus();
  }, [appUser, domain.id, domain.likes]);

  // Toggle like function
  const toggleLike = async () => {
    if (!appUser) {
      toast.error("Please sign in to like domains");
      return;
    }

    if (!domain.id) {
      console.error("Cannot like domain without ID");
      toast.error("Error processing like action");
      return;
    }

    if (isLoading) {
      return; // Prevent multiple clicks
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
          // Handle unique constraint violation
          if (likeError.code === '23505') {
            console.log("User already liked this domain");
            setIsLiked(true);
            
            // Refetch current like count
            const { data: domainData } = await supabase
              .from('domains')
              .select('likes')
              .eq('id', domain.id)
              .single();
              
            if (domainData && typeof domainData.likes === 'number') {
              setLikes(domainData.likes);
            }
          } else {
            console.error("Error adding like:", likeError);
            toast.error("Failed to like domain");
            return;
          }
        } else {
          // Optimistically update UI state
          setIsLiked(true);
          setLikes(prev => prev + 1);
          toast.success(`You liked ${domain.name}`);
        }
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
          return;
        }
        
        // Optimistically update UI state
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
        toast.success(`You unliked ${domain.name}`);
      }
    } catch (error) {
      console.error("Error in toggleLike:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
    }
  };

  return { likes, isLiked, toggleLike, isLoading };
}
