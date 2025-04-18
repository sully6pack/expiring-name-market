

-- Check if triggers exist and if not, create them

-- Create function to increment domain likes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'increment_domain_likes') THEN
    CREATE OR REPLACE FUNCTION increment_domain_likes()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE domains
      SET likes = likes + 1
      WHERE id = NEW.domain_id;
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
      SET likes = greatest(0, likes - 1)
      WHERE id = OLD.domain_id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create trigger for incrementing likes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'domain_like_added') THEN
    CREATE TRIGGER domain_like_added
    AFTER INSERT ON domain_likes
    FOR EACH ROW
    EXECUTE FUNCTION increment_domain_likes();
  END IF;
END $$;

-- Create trigger for decrementing likes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'domain_like_removed') THEN
    CREATE TRIGGER domain_like_removed
    AFTER DELETE ON domain_likes
    FOR EACH ROW
    EXECUTE FUNCTION decrement_domain_likes();
  END IF;
END $$;

-- Enable realtime for domains table
ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_likes;

-- Enable full replica identity for realtime to work properly
ALTER TABLE public.domains REPLICA IDENTITY FULL;
ALTER TABLE public.domain_likes REPLICA IDENTITY FULL;

