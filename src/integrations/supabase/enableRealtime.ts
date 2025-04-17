
import { supabase } from "./client";

// Enable realtime for our application
export const enableRealtimeForDomains = async () => {
  try {
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
              
              // Dispatch a custom event to notify components about the status change
              window.dispatchEvent(new CustomEvent('domain-admin-pick-changed', { 
                detail: { 
                  domainId: payload.new.id,
                  isAdminPick: payload.new.is_admin_pick 
                } 
              }));
            }
            
            if (payload.new.is_sponsored !== payload.old.is_sponsored) {
              console.log(`Domain ${payload.new.name} sponsored status changed: ${payload.old.is_sponsored} → ${payload.new.is_sponsored}`);
              
              // Dispatch a custom event to notify components about the status change
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
      .subscribe();
      
    console.log('Realtime enabled for domains table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domains:', error);
    return false;
  }
};

// Enable realtime for domain_likes table
export const enableRealtimeForLikes = async () => {
  try {
    // Use channel.on to subscribe to realtime changes
    const channel = supabase
      .channel('public:domain_likes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'domain_likes' },
        (payload) => {
          console.log('Change received for domain_likes!', payload);
          if (payload.eventType === 'INSERT') {
            console.log(`New like added for domain ID: ${payload.new.domain_id} by user ID: ${payload.new.user_id}`);
            
            // You could dispatch a custom event here if needed
            window.dispatchEvent(new CustomEvent('domain-like-added', { 
              detail: { 
                domainId: payload.new.domain_id,
                userId: payload.new.user_id 
              } 
            }));
          } else if (payload.eventType === 'DELETE') {
            console.log(`Like removed for domain ID: ${payload.old.domain_id} by user ID: ${payload.old.user_id}`);
            
            // You could dispatch a custom event here if needed
            window.dispatchEvent(new CustomEvent('domain-like-removed', { 
              detail: { 
                domainId: payload.old.domain_id,
                userId: payload.old.user_id 
              } 
            }));
          }
        }
      )
      .subscribe();
      
    console.log('Realtime enabled for domain_likes table');
    return true;
  } catch (error) {
    console.error('Error enabling realtime for domain_likes:', error);
    return false;
  }
};

// Initialize realtime
export const initializeRealtime = async () => {
  await enableRealtimeForDomains();
  await enableRealtimeForLikes();
  console.log('Realtime initialized for domains and likes');
};
