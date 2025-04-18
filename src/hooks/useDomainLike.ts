
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

  // Initialize like status and count
  useEffect(() => {
    // Update likes when domain.likes changes externally
    if (domain.likes !== undefined && domain.likes !== likes) {
      setLikes(domain.likes);
    }
    
    const fetchLikeStatus = async () => {
      if (!appUser || !domain.id) {
        setIsLiked(false);
        return;
      }

      setIsLoading(true);
      try {
        // Check if user has liked this domain
        const { data, error } = await supabase
          .from('domain_likes')
          .select('*')
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id)
          .maybeSingle();  // Use maybeSingle instead of single to avoid errors

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking like status:", error);
        }

        // Update liked state based on whether data was found
        setIsLiked(!!data);
      } catch (error) {
        console.error("Error in fetchLikeStatus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikeStatus();
  }, [appUser, domain.id, domain.likes]);

  // Listen for real-time updates
  useEffect(() => {
    if (!domain.id) return;

    // Set up listener for domain like changes
    const channel = supabase
      .channel(`domain_likes_${domain.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'domains', filter: `id=eq.${domain.id}` },
        (payload: any) => {
          if (payload.new && typeof payload.new.likes === 'number') {
            console.log(`Real-time update for domain ${domain.id}: likes = ${payload.new.likes}`);
            setLikes(payload.new.likes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [domain.id]);

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

  return { likes, isLiked, toggleLike, isLoading };
}
