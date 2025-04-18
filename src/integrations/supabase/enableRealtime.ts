
import { supabase } from "./client";
import { toast } from "sonner";

// Enable realtime for domains table
export const enableRealtimeForDomains = async () => {
  try {
    console.log("Setting up domain realtime listeners");
    
    // Use channel.on to subscribe to realtime changes
    const channel = supabase
      .channel('domains-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'domains' },
        (payload) => {
          console.log('Change received for domains!', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
            console.log(`Domain ${payload.new.name} updated`);
            
            // Log changes to likes
            if (payload.new.likes !== payload.old.likes) {
              console.log(`Domain ${payload.new.name} likes changed: ${payload.old.likes} → ${payload.new.likes}`);
              
              // Dispatch a custom event to notify components
              window.dispatchEvent(new CustomEvent('domain-likes-changed', { 
                detail: { 
                  domainId: payload.new.id,
                  likes: payload.new.likes 
                } 
              }));
            }
            
            // Dispatch a generic domain updated event
            window.dispatchEvent(new CustomEvent('domain-updated', { 
              detail: payload.new
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log(`Domains channel subscription status:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to domains table changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to domains table changes');
          toast.error('Error connecting to real-time updates');
        }
      });
      
    console.log('Realtime enabled for domains table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domains:', error);
    toast.error('Error setting up real-time updates');
    return false;
  }
};

// Enable realtime for domain_likes table
export const enableRealtimeForLikes = async () => {
  try {
    console.log("Setting up domain_likes realtime listeners");
    
    // Use channel.on to subscribe to realtime changes
    const channel = supabase
      .channel('domain-likes-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'domain_likes' },
        (payload) => {
          console.log('Change received for domain_likes!', payload);
          
          if (payload.eventType === 'INSERT') {
            console.log(`New like added for domain ID: ${payload.new.domain_id} by user ID: ${payload.new.user_id}`);
            
            // Dispatch a custom event to notify components
            window.dispatchEvent(new CustomEvent('domain-like-added', { 
              detail: { 
                domainId: payload.new.domain_id,
                userId: payload.new.user_id 
              } 
            }));
          } else if (payload.eventType === 'DELETE') {
            console.log(`Like removed for domain ID: ${payload.old.domain_id} by user ID: ${payload.old.user_id}`);
            
            // Dispatch a custom event to notify components
            window.dispatchEvent(new CustomEvent('domain-like-removed', { 
              detail: { 
                domainId: payload.old.domain_id,
                userId: payload.old.user_id 
              } 
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log(`Domain likes channel subscription status:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to domain_likes table changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to domain_likes table changes');
          toast.error('Error connecting to real-time updates');
        }
      });
      
    console.log('Realtime enabled for domain_likes table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domain_likes:', error);
    toast.error('Error setting up real-time updates');
    return false;
  }
};

// Initialize realtime
export const initializeRealtime = async () => {
  console.log("Initializing realtime for domains and likes");
  
  // Clean up any existing channels first to prevent duplicates
  try {
    supabase.removeChannel(supabase.channel('domains-channel'));
    supabase.removeChannel(supabase.channel('domain-likes-channel'));
  } catch (error) {
    console.log('No existing channels to remove');
  }
  
  const domainsResult = await enableRealtimeForDomains();
  const likesResult = await enableRealtimeForLikes();
  
  if (domainsResult && likesResult) {
    console.log('Realtime successfully initialized for domains and likes');
  } else {
    console.error('Failed to initialize realtime for domains and/or likes');
    toast.error('Error initializing real-time updates');
  }
};
