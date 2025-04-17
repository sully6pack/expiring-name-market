
import { supabase } from "./client";
import { toast } from "sonner";

// Enable realtime for our application
export const enableRealtimeForDomains = async () => {
  try {
    console.log("Setting up domain realtime listeners");
    
    // Use channel.on to subscribe to realtime changes
    const channel = supabase
      .channel('public:domains')
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
            
            // Log changes to admin_pick and sponsored status
            if (payload.new.is_admin_pick !== payload.old.is_admin_pick) {
              console.log(`Domain ${payload.new.name} staff pick status changed: ${payload.old.is_admin_pick} → ${payload.new.is_admin_pick}`);
              
              // Dispatch a custom event to notify components
              window.dispatchEvent(new CustomEvent('domain-admin-pick-changed', { 
                detail: { 
                  domainId: payload.new.id,
                  isAdminPick: payload.new.is_admin_pick 
                } 
              }));
            }
            
            if (payload.new.is_sponsored !== payload.old.is_sponsored) {
              console.log(`Domain ${payload.new.name} sponsored status changed: ${payload.old.is_sponsored} → ${payload.new.is_sponsored}`);
              
              // Dispatch a custom event to notify components
              window.dispatchEvent(new CustomEvent('domain-sponsored-changed', { 
                detail: { 
                  domainId: payload.new.id,
                  isSponsored: payload.new.is_sponsored 
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
          toast.error('Error connecting to real-time updates. Some features may not work properly.');
        }
      });
      
    console.log('Realtime enabled for domains table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domains:', error);
    toast.error('Error setting up real-time updates. Some features may not work properly.');
    return false;
  }
};

// Enable realtime for domain_likes table
export const enableRealtimeForLikes = async () => {
  try {
    console.log("Setting up domain_likes realtime listeners");
    
    // Use channel.on to subscribe to realtime changes
    const channel = supabase
      .channel('public:domain_likes')
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
          toast.error('Error connecting to real-time updates. Some features may not work properly.');
        }
      });
      
    console.log('Realtime enabled for domain_likes table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domain_likes:', error);
    toast.error('Error setting up real-time updates. Some features may not work properly.');
    return false;
  }
};

// Initialize realtime
export const initializeRealtime = async () => {
  console.log("Initializing realtime for domains and likes");
  const domainsResult = await enableRealtimeForDomains();
  const likesResult = await enableRealtimeForLikes();
  
  if (domainsResult && likesResult) {
    console.log('Realtime successfully initialized for domains and likes');
  } else {
    console.error('Failed to initialize realtime for domains and/or likes');
    toast.error('Error initializing real-time updates');
  }
};
