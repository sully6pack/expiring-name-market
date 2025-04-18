
-- Check if triggers exist and if not, create them

-- Create function to increment domain likes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_domain_likes') THEN
    CREATE OR REPLACE FUNCTION increment_domain_likes()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE domains
      SET likes = COALESCE(likes, 0) + 1
      WHERE id = NEW.domain_id;
      
      -- For debugging
      RAISE NOTICE 'Incremented likes for domain %', NEW.domain_id;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create function to decrement domain likes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'decrement_domain_likes') THEN
    CREATE OR REPLACE FUNCTION decrement_domain_likes()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE domains
      SET likes = GREATEST(0, COALESCE(likes, 0) - 1)
      WHERE id = OLD.domain_id;
      
      -- For debugging
      RAISE NOTICE 'Decremented likes for domain %', OLD.domain_id;
      
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Drop existing triggers if they exist to ensure clean recreation
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'domain_like_added') THEN
    DROP TRIGGER IF EXISTS domain_like_added ON domain_likes;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'domain_like_removed') THEN
    DROP TRIGGER IF EXISTS domain_like_removed ON domain_likes;
  END IF;
END $$;

-- Create trigger for incrementing likes
CREATE TRIGGER domain_like_added
AFTER INSERT ON domain_likes
FOR EACH ROW
EXECUTE FUNCTION increment_domain_likes();

-- Create trigger for decrementing likes
CREATE TRIGGER domain_like_removed
AFTER DELETE ON domain_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_domain_likes();

-- Enable realtime for domains table and domain_likes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_likes;

-- Enable full replica identity for realtime to work properly with all column values
ALTER TABLE public.domains REPLICA IDENTITY FULL;
ALTER TABLE public.domain_likes REPLICA IDENTITY FULL;
