
-- Enable replica identity for domains table to track changes for real-time updates
ALTER TABLE public.domains REPLICA IDENTITY FULL;

-- Enable replica identity for domain_likes table to track changes for real-time updates
ALTER TABLE public.domain_likes REPLICA IDENTITY FULL;

-- Add domains and domain_likes tables to the supabase_realtime publication if not already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'domains'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'domain_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_likes;
  END IF;
END $$;
