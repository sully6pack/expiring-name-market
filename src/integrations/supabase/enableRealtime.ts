
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
            console.log(`Domain ${payload.new.name} likes changed from ${payload.old.likes} to ${payload.new.likes}`);
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
          } else if (payload.eventType === 'DELETE') {
            console.log(`Like removed for domain ID: ${payload.old.domain_id} by user ID: ${payload.old.user_id}`);
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
