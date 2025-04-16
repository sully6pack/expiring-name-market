
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
