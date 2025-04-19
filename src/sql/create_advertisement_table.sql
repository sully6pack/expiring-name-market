
-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active advertisements"
  ON advertisements
  FOR SELECT
  TO PUBLIC
  USING (is_active = true);

CREATE POLICY "Only admins can insert advertisements"
  ON advertisements
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ));

CREATE POLICY "Only admins can update advertisements"
  ON advertisements
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ));

CREATE POLICY "Only admins can delete advertisements"
  ON advertisements
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ));

-- Add Realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE advertisements;
ALTER TABLE advertisements REPLICA IDENTITY FULL;
