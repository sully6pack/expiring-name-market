import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Domain } from "@/types";

export function useDomainLike(domain: Domain) {
  const { appUser } = useAuth();
  const [likes, setLikes] = useState<number>(domain.likes);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Check if the user has liked this domain when the component mounts
  // or when the user or domain changes
  useEffect(() => {
    async function checkIfLiked() {
      if (!appUser) {
        setIsLiked(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('domain_likes')
          .select('*')
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking like status:", error);
        }
        
        setIsLiked(!!data);
      } catch (error) {
        console.error("Error in checkIfLiked:", error);
      }
    }

    // Also fetch the current like count from the database
    async function fetchCurrentLikes() {
      try {
        const { data, error } = await supabase
          .from('domains')
          .select('likes')
          .eq('id', domain.id)
          .single();
          
        if (error) {
          console.error("Error fetching current likes:", error);
          return;
        }
        
        setLikes(data.likes);
      } catch (error) {
        console.error("Error in fetchCurrentLikes:", error);
      }
    }

    fetchCurrentLikes();
    checkIfLiked();
  }, [appUser, domain.id]);

  // Set up a realtime subscription to keep likes in sync
  useEffect(() => {
    const channel = supabase
      .channel('public:domains')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'domains', filter: `id=eq.${domain.id}` },
        (payload: any) => {
          if (payload.new && payload.new.likes !== undefined) {
            console.log('Realtime update received:', payload.new.likes);
            setLikes(payload.new.likes);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [domain.id]);

  const toggleLike = async () => {
    if (!appUser) {
      toast.error("Please sign in to like domains");
      return;
    }

    setIsLoading(true);
    try {
      // Optimistically update UI first
      const newIsLiked = !isLiked;
      const likeDelta = newIsLiked ? 1 : -1;
      setIsLiked(newIsLiked);
      setLikes(prevLikes => prevLikes + likeDelta);
      
      if (!isLiked) {
        // Add like
        const { error: likeError } = await supabase
          .from('domain_likes')
          .insert({ 
            domain_id: domain.id, 
            user_id: appUser.id 
          });
          
        if (likeError) {
          if (likeError.code === '23505') {
            // If this fails because we already liked it, just keep the UI updated
            toast.error("You've already liked this domain");
            setIsLoading(false);
            return;
          }
          // Revert optimistic update on error
          setIsLiked(false);
          setLikes(prevLikes => prevLikes - 1);
          throw likeError;
        }
        
        toast.success(`You liked ${domain.name}`);
      } else {
        // Remove like
        const { error: unlikeError } = await supabase
          .from('domain_likes')
          .delete()
          .eq('domain_id', domain.id)
          .eq('user_id', appUser.id);
          
        if (unlikeError) {
          // Revert optimistic update on error
          setIsLiked(true);
          setLikes(prevLikes => prevLikes + 1);
          throw unlikeError;
        }
      }
    } catch (error) {
      console.error("Error updating likes:", error);
      toast.error("Failed to update likes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { likes, isLiked, toggleLike, isLoading };
}
