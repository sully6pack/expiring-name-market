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
        } else if (domainData && typeof domainData.likes === 'number') {
          console.log(`Setting likes for ${domain.name} to ${domainData.likes}`);
          setLikes(domainData.likes);
        }

        // Update liked state based on if the user has liked this domain
        const hasLiked = !!likeData;
        console.log(`Domain ${domain.name} isLiked: ${hasLiked}`);
        setIsLiked(hasLiked);
      } catch (error) {
        console.error("Error in fetchLikeStatus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeStatus();
  }, [appUser, domain.id, domain.name, domain.likes]);

  // Listen for global like/unlike events and update state accordingly
  useEffect(() => {
    const handleLikesChanged = (event: CustomEvent) => {
      if (event.detail.domainId === domain.id) {
        console.log(`Global event: domain ${domain.id} likes changed to ${event.detail.likes}`);
        setLikes(event.detail.likes);
      }
    };

    const handleLikeAdded = (event: CustomEvent) => {
      if (event.detail.domainId === domain.id && appUser && event.detail.userId === appUser.id) {
        console.log(`Global event: user ${appUser.id} liked domain ${domain.id}`);
        setIsLiked(true);
      }
    };

    const handleLikeRemoved = (event: CustomEvent) => {
      if (event.detail.domainId === domain.id && appUser && event.detail.userId === appUser.id) {
        console.log(`Global event: user ${appUser.id} unliked domain ${domain.id}`);
        setIsLiked(false);
      }
    };

    // Add event listeners for global events
    window.addEventListener('domain-likes-changed', handleLikesChanged as EventListener);
    window.addEventListener('domain-like-added', handleLikeAdded as EventListener);
    window.addEventListener('domain-like-removed', handleLikeRemoved as EventListener);

    return () => {
      // Remove event listeners
      window.removeEventListener('domain-likes-changed', handleLikesChanged as EventListener);
      window.removeEventListener('domain-like-added', handleLikeAdded as EventListener);
      window.removeEventListener('domain-like-removed', handleLikeRemoved as EventListener);
    };
  }, [domain.id, appUser]);

  // Listen for real-time updates to likes
  useEffect(() => {
    if (!domain.id) return;
    
    console.log(`Setting up realtime listeners for domain ${domain.id}`);
    
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
      .subscribe((status) => {
        console.log(`Domain ${domain.id} channel status:`, status);
      });

    // Also listen for changes in the domain_likes table to update isLiked state
    let likesChannel = null;
    if (appUser) {
      likesChannel = supabase
        .channel(`domain-likes-${domain.id}-${appUser.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'domain_likes', 
            filter: `domain_id=eq.${domain.id} AND user_id=eq.${appUser.id}` 
          },
          (payload) => {
            console.log(`Domain likes change detected for user ${appUser.id}: ${payload.eventType}`);
            if (payload.eventType === 'INSERT') {
              console.log(`User ${appUser.id} liked domain ${domain.id}`);
              setIsLiked(true);
            } else if (payload.eventType === 'DELETE') {
              console.log(`User ${appUser.id} unliked domain ${domain.id}`);
              setIsLiked(false);
            }
          }
        )
        .subscribe((status) => {
          console.log(`Domain likes ${domain.id} channel status:`, status);
        });
    }

    // Cleanup on unmount
    return () => {
      console.log(`Cleaning up realtime listeners for domain ${domain.id}`);
      supabase.removeChannel(domainChannel);
      if (likesChannel) {
        supabase.removeChannel(likesChannel);
      }
    };
  }, [domain.id, appUser]);

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
      console.log("Like operation already in progress, ignoring click");
      return;
    }

    setIsLoading(true);
    console.log(`Toggling like for domain ${domain.id}, current state: ${isLiked}`);

    try {
      if (!isLiked) {
        // Add like - do NOT manually update likes count as DB trigger handles it
        const { error: likeError } = await supabase
          .from('domain_likes')
          .insert({ 
            domain_id: domain.id, 
            user_id: appUser.id 
          });
          
        if (likeError) {
          console.error("Error adding like:", likeError);
          
          // Handle unique constraint violation
          if (likeError.code === '23505') { // Unique constraint violation
            console.log("User already liked this domain");
            toast.error("You've already liked this domain");
            // Refresh like status to sync UI with actual DB state
            setIsLiked(true);
            
            // Refetch current like count to ensure consistency
            const { data: domainData } = await supabase
              .from('domains')
              .select('likes')
              .eq('id', domain.id)
              .single();
              
            if (domainData && typeof domainData.likes === 'number') {
              setLikes(domainData.likes);
            }
          } else {
            toast.error("Failed to like domain. Please try again.");
          }
          return;
        }
        
        // UI state will be updated by the realtime subscription
        toast.success(`You liked ${domain.name}`);
      } else {
        // Remove like - do NOT manually update likes count as DB trigger handles it
        const { error: unlikeError } = await supabase
          .from('domain_likes')
          .delete()
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id);
          
        if (unlikeError) {
          console.error("Error removing like:", unlikeError);
          toast.error("Failed to unlike domain. Please try again.");
          return;
        }
        
        // UI state will be updated by the realtime subscription
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
