
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

        if (likeError && likeError.code !== 'PGRST116') {
          console.error("Error checking like status:", likeError);
        }

        // Fetch current likes count directly from domains table
        const { data: domainData, error: domainError } = await supabase
          .from('domains')
          .select('likes')
          .eq('id', domain.id)
          .single();

        if (domainError) {
          console.error("Error fetching domain likes:", domainError);
        } else {
          // Only update likes from database if it exists to prevent resetting to 0
          if (domainData && typeof domainData.likes === 'number') {
            setLikes(domainData.likes);
            console.log(`Updated likes for ${domain.name} to ${domainData.likes}`);
          }
        }

        // Update liked state based on if the user has liked this domain
        setIsLiked(!!likeData);
        console.log(`Domain ${domain.name} isLiked: ${!!likeData}`);
      } catch (error) {
        console.error("Error in fetchLikeStatus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeStatus();
  }, [appUser, domain.id, domain.name]);

  // Listen for real-time updates to likes
  useEffect(() => {
    if (!domain.id) return;
    
    // Subscribe to changes in the domains table for this specific domain
    const domainChannel = supabase
      .channel(`domain-${domain.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'domains', filter: `id=eq.${domain.id}` },
        (payload) => {
          if (payload.new && typeof payload.new.likes === 'number') {
            console.log(`Real-time update for domain ${domain.id}: likes = ${payload.new.likes}`);
            setLikes(payload.new.likes);
          }
        }
      )
      .subscribe();

    // Also listen for changes in the domain_likes table to update isLiked state
    const likesChannel = appUser ? supabase
      .channel(`domain-likes-${domain.id}-${appUser.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'domain_likes', 
          filter: `domain_id=eq.${domain.id} AND user_id=eq.${appUser.id}` 
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log(`User ${appUser.id} liked domain ${domain.id}`);
            setIsLiked(true);
          } else if (payload.eventType === 'DELETE') {
            console.log(`User ${appUser.id} unliked domain ${domain.id}`);
            setIsLiked(false);
          }
        }
      )
      .subscribe() : null;

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(domainChannel);
      if (likesChannel) supabase.removeChannel(likesChannel);
    };
  }, [domain.id, appUser]);

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
        // Optimistically update UI
        setIsLiked(true);
        setLikes(prev => prev + 1);
        
        // Add like
        const { error: likeError } = await supabase
          .from('domain_likes')
          .insert({ 
            domain_id: domain.id, 
            user_id: appUser.id 
          });
          
        if (likeError) {
          // Revert optimistic update on error
          console.error("Error adding like:", likeError);
          toast.error("Failed to like domain");
          setIsLiked(false);
          setLikes(prev => prev - 1);
          return;
        }
        
        toast.success(`You liked ${domain.name}`);
      } else {
        // Optimistically update UI
        setIsLiked(false);
        setLikes(prev => Math.max(0, prev - 1));
        
        // Remove like
        const { error: unlikeError } = await supabase
          .from('domain_likes')
          .delete()
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id);
          
        if (unlikeError) {
          // Revert optimistic update on error
          console.error("Error removing like:", unlikeError);
          toast.error("Failed to unlike domain");
          setIsLiked(true);
          setLikes(prev => prev + 1);
          return;
        }
        
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
