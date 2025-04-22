
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
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(false);

  // Fetch current like status and count
  const fetchLikeData = async () => {
    if (!appUser || !domain.id) {
      setIsLiked(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch like status
      const { data: likeData, error: likeError } = await supabase
        .from('domain_likes')
        .select('*')
        .eq('domain_id', domain.id)
        .eq('user_id', appUser.id)
        .maybeSingle();

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
        console.error("Error fetching domain likes count:", domainError);
      }

      // Update states
      setIsLiked(!!likeData);
      if (domainData?.likes !== undefined) {
        setLikes(domainData.likes);
      }
    } catch (error) {
      console.error("Error in fetchLikeData:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize like status and count
  useEffect(() => {
    fetchLikeData();
  }, [appUser, domain.id]);

  // Set up manual refresh interval as fallback if realtime fails
  useEffect(() => {
    // Only set up the interval if realtime is not active
    if (!isRealtimeActive && domain.id && appUser) {
      console.log("Setting up manual refresh interval as fallback");
      const intervalId = setInterval(() => {
        fetchLikeData();
      }, 10000); // Refresh every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isRealtimeActive, domain.id, appUser]);

  // Listen for real-time updates
  useEffect(() => {
    if (!domain.id) return;

    // Set up listener for domain like changes
    const channel = supabase
      .channel(`domain_likes_${domain.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'domains', filter: `id=eq.${domain.id}` },
        (payload: any) => {
          setIsRealtimeActive(true);
          if (payload.new && typeof payload.new.likes === 'number') {
            console.log(`Real-time update for domain ${domain.id}: likes = ${payload.new.likes}`);
            setLikes(payload.new.likes);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'domain_likes', filter: `domain_id=eq.${domain.id}` },
        (payload: any) => {
          setIsRealtimeActive(true);
          if (payload.eventType === 'INSERT' && payload.new.user_id === appUser?.id) {
            setIsLiked(true);
            setLikes(prev => prev + 1);
          } else if (payload.eventType === 'DELETE' && payload.old.user_id === appUser?.id) {
            setIsLiked(false);
            setLikes(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime status for domain ${domain.id} likes:`, status);
        setIsRealtimeActive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [domain.id, appUser?.id]);

  // Listen for global domain events as a backup
  useEffect(() => {
    const handleDomainLikeChanged = (event: CustomEvent) => {
      if (event.detail.domainId === domain.id) {
        console.log("Received domain likes changed event:", event.detail);
        setLikes(event.detail.likes);
      }
    };

    const handleDomainLikeAdded = (event: CustomEvent) => {
      if (event.detail.domainId === domain.id && event.detail.userId === appUser?.id) {
        console.log("Received like added event");
        setIsLiked(true);
      }
    };

    const handleDomainLikeRemoved = (event: CustomEvent) => {
      if (event.detail.domainId === domain.id && event.detail.userId === appUser?.id) {
        console.log("Received like removed event");
        setIsLiked(false);
      }
    };

    window.addEventListener('domain-likes-changed', handleDomainLikeChanged as EventListener);
    window.addEventListener('domain-like-added', handleDomainLikeAdded as EventListener);
    window.addEventListener('domain-like-removed', handleDomainLikeRemoved as EventListener);

    return () => {
      window.removeEventListener('domain-likes-changed', handleDomainLikeChanged as EventListener);
      window.removeEventListener('domain-like-added', handleDomainLikeAdded as EventListener);
      window.removeEventListener('domain-like-removed', handleDomainLikeRemoved as EventListener);
    };
  }, [domain.id, appUser?.id]);

  // Toggle like function with improved error handling and optimistic updates
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
    // Store the current action for handling errors
    const action = isLiked ? 'unlike' : 'like';
    setLastAction(action);
    
    try {
      // Optimistically update UI
      setIsLiked(!isLiked);
      setLikes(prev => isLiked ? Math.max(0, prev - 1) : prev + 1);
      
      if (!isLiked) {
        // Add like
        const { error } = await supabase
          .from('domain_likes')
          .insert({ 
            domain_id: domain.id, 
            user_id: appUser.id 
          });
          
        if (error) {
          // Handle unique constraint violation (already liked)
          if (error.code === '23505') {
            console.log("User already liked this domain");
            // No need to revert UI as it's already correct
          } else {
            console.error("Error adding like:", error);
            // Revert optimistic update
            setIsLiked(false);
            setLikes(prev => Math.max(0, prev - 1));
            toast.error("Failed to like domain");
          }
        } else {
          toast.success(`You liked ${domain.name}`);
          // Refetch to ensure we have the latest data
          setTimeout(fetchLikeData, 1000);
        }
      } else {
        // Remove like
        const { error } = await supabase
          .from('domain_likes')
          .delete()
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id);
          
        if (error) {
          console.error("Error removing like:", error);
          // Revert optimistic update
          setIsLiked(true);
          setLikes(prev => prev + 1);
          toast.error("Failed to unlike domain");
        } else {
          toast.success(`You unliked ${domain.name}`);
          // Refetch to ensure we have the latest data
          setTimeout(fetchLikeData, 1000);
        }
      }
    } catch (error) {
      console.error("Error in toggleLike:", error);
      // Revert optimistic update on error
      setIsLiked(action === 'unlike');
      setLikes(prev => action === 'unlike' ? prev + 1 : Math.max(0, prev - 1));
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
      setLastAction(null);
    }
  };

  return { 
    likes, 
    isLiked, 
    toggleLike, 
    isLoading,
    isRealtimeActive  // Added to help with debugging
  };
}
