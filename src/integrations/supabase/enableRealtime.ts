
import { supabase } from "./client";

// Enable realtime for our application
export const enableRealtimeForDomains = async () => {
  // Enable realtime for the domains table
  const { data, error } = await supabase.rpc('supabase_realtime', {
    table: 'domains',
    insert: true,
    update: true,
    delete: true,
    schema: 'public'
  });

  if (error) {
    console.error('Error enabling realtime for domains:', error);
    return false;
  }

  return true;
};

// Enable realtime for domain_likes table
export const enableRealtimeForLikes = async () => {
  const { data, error } = await supabase.rpc('supabase_realtime', {
    table: 'domain_likes',
    insert: true,
    update: true,
    delete: true,
    schema: 'public'
  });

  if (error) {
    console.error('Error enabling realtime for domain_likes:', error);
    return false;
  }

  return true;
};

// Initialize realtime
export const initializeRealtime = async () => {
  await enableRealtimeForDomains();
  await enableRealtimeForLikes();
  console.log('Realtime initialized for domains and likes');
};
