import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Domain } from "@/types";

export function useDomainLike(domain: Domain) {
  const { appUser } = useAuth();
  const [likes, setLikes] = useState<number>(domain.likes || 0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if the user has liked this domain when the component mounts
  useEffect(() => {
    async function checkIfLiked() {
      if (!appUser || !domain.id) {
        setIsLiked(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error in checkIfLiked:", error);
        setIsLoading(false);
      }
    }

    checkIfLiked();
  }, [appUser, domain.id]);

  // Get the current like count from the database
  useEffect(() => {
    async function fetchCurrentLikes() {
      if (!domain.id) return;
      
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
        
        setLikes(data.likes || 0);
      } catch (error) {
        console.error("Error in fetchCurrentLikes:", error);
      }
    }

    fetchCurrentLikes();
  }, [domain.id]);

  // Set up a realtime subscription to keep likes in sync
  useEffect(() => {
    if (!domain.id) return;
    
    const channel = supabase
      .channel(`domains-${domain.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'domains', filter: `id=eq.${domain.id}` },
        (payload: any) => {
          if (payload.new && typeof payload.new.likes === 'number') {
            console.log('Realtime update received for domain likes:', payload.new.likes);
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
          toast.error("Failed to like domain. Please try again.");
          setIsLoading(false);
          return;
        }
        
        setIsLiked(true);
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
          toast.error("Failed to unlike domain. Please try again.");
          setIsLoading(false);
          return;
        }
        
        setIsLiked(false);
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
