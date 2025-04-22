
import { supabase } from "./client";
import { toast } from "sonner";

// Maximum number of retry attempts
const MAX_RETRIES = 3;

// Enable realtime for domains table with retry mechanism
export const enableRealtimeForDomains = async (retryCount = 0) => {
  try {
    console.log(`Setting up domain realtime listeners (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
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
          // Reset any error toasts that might be showing
          toast.dismiss('domains-realtime-error');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to domains table changes');
          
          // Only show toast on first attempt
          if (retryCount === 0) {
            toast.error('Error connecting to real-time updates', {
              id: 'domains-realtime-error',
              duration: 5000
            });
          }
          
          // Retry connection if not exceeding max retries
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying domains connection in ${(retryCount + 1) * 2} seconds...`);
            setTimeout(() => {
              enableRealtimeForDomains(retryCount + 1);
            }, (retryCount + 1) * 2000);
          }
        }
      });
      
    console.log('Realtime subscription request sent for domains table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domains:', error);
    
    // Only show toast on first attempt
    if (retryCount === 0) {
      toast.error('Error setting up real-time updates', {
        id: 'domains-realtime-error',
        duration: 5000
      });
    }
    
    // Retry connection if not exceeding max retries
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying domains connection in ${(retryCount + 1) * 2} seconds...`);
      setTimeout(() => {
        enableRealtimeForDomains(retryCount + 1);
      }, (retryCount + 1) * 2000);
    }
    
    return false;
  }
};

// Enable realtime for domain_likes table with retry mechanism
export const enableRealtimeForLikes = async (retryCount = 0) => {
  try {
    console.log(`Setting up domain_likes realtime listeners (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    
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
          // Reset any error toasts that might be showing
          toast.dismiss('likes-realtime-error');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to domain_likes table changes');
          
          // Only show toast on first attempt
          if (retryCount === 0) {
            toast.error('Error connecting to real-time updates', {
              id: 'likes-realtime-error',
              duration: 5000
            });
          }
          
          // Retry connection if not exceeding max retries
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying likes connection in ${(retryCount + 1) * 2} seconds...`);
            setTimeout(() => {
              enableRealtimeForLikes(retryCount + 1);
            }, (retryCount + 1) * 2000);
          }
        }
      });
      
    console.log('Realtime subscription request sent for domain_likes table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domain_likes:', error);
    
    // Only show toast on first attempt
    if (retryCount === 0) {
      toast.error('Error setting up real-time updates', {
        id: 'likes-realtime-error',
        duration: 5000
      });
    }
    
    // Retry connection if not exceeding max retries
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying likes connection in ${(retryCount + 1) * 2} seconds...`);
      setTimeout(() => {
        enableRealtimeForLikes(retryCount + 1);
      }, (retryCount + 1) * 2000);
    }
    
    return false;
  }
};

// Initialize realtime with improved error handling
export const initializeRealtime = async () => {
  console.log("Initializing realtime for domains and likes");
  
  // Clean up any existing channels first to prevent duplicates
  try {
    supabase.removeChannel(supabase.channel('domains-channel'));
    supabase.removeChannel(supabase.channel('domain-likes-channel'));
  } catch (error) {
    console.log('No existing channels to remove');
  }
  
  // Add a small delay before initializing to ensure the client is ready
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const domainsResult = await enableRealtimeForDomains();
  const likesResult = await enableRealtimeForLikes();
  
  if (domainsResult && likesResult) {
    console.log('Realtime initialization process started for domains and likes');
  } else {
    console.log('Started realtime with automatic retry mechanism');
  }
  
  // Set up a reconnect mechanism for page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Page became visible, checking realtime connections');
      initializeRealtime();
    }
  });
};
