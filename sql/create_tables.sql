
-- Create user profiles table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT
);

-- Create domains table
CREATE TABLE domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  is_sponsored BOOLEAN DEFAULT FALSE,
  is_admin_pick BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT NOT NULL,
  tld TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  verification_method TEXT,
  verification_code TEXT,
  verification_date TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  buyer_id UUID REFERENCES users(id),
  purchase_date TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  payment_intent_id TEXT
);

-- Create domain likes table (for recording which users like which domains)
CREATE TABLE domain_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(domain_id, user_id)
);

-- Create domain views table (for analytics)
CREATE TABLE domain_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Row Level Security Policies
-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to see all profiles
CREATE POLICY "Admins can view all profiles"
  ON users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles"
  ON users FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Domains table RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view verified domains
CREATE POLICY "Anyone can view verified domains"
  ON domains FOR SELECT
  USING (is_verified = TRUE);

-- Allow sellers to view their own domains (even unverified)
CREATE POLICY "Sellers can view their own domains"
  ON domains FOR SELECT
  USING (auth.uid() = seller_id);

-- Allow sellers to delete their own domains
CREATE POLICY "Sellers can delete their own domains"
  ON domains FOR DELETE
  USING (auth.uid() = seller_id);

-- Allow sellers to update their own domains
CREATE POLICY "Sellers can update their own domains"
  ON domains FOR UPDATE
  USING (auth.uid() = seller_id);

-- Allow users to insert new domains
CREATE POLICY "Users can insert new domains"
  ON domains FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Allow admins to view all domains
CREATE POLICY "Admins can view all domains"
  ON domains FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Allow admins to update all domains
CREATE POLICY "Admins can update all domains"
  ON domains FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Transactions table RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow buyers to view their own transactions
CREATE POLICY "Buyers can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = buyer_id);

-- Allow sellers to view their own transactions
CREATE POLICY "Sellers can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = seller_id);

-- Allow authenticated users to insert transactions
CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Allow admins to view all transactions
CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- Domain likes table RLS
ALTER TABLE domain_likes ENABLE ROW LEVEL SECURITY;

-- Allow users to like domains
CREATE POLICY "Users can like domains"
  ON domain_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own likes
CREATE POLICY "Users can view their own likes"
  ON domain_likes FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to remove their own likes
CREATE POLICY "Users can remove their own likes"
  ON domain_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to increment domain likes count
CREATE OR REPLACE FUNCTION increment_domain_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE domains
  SET likes = likes + 1
  WHERE id = NEW.domain_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER domain_like_added
AFTER INSERT ON domain_likes
FOR EACH ROW
EXECUTE FUNCTION increment_domain_likes();

-- Create trigger to decrement domain likes count
CREATE OR REPLACE FUNCTION decrement_domain_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE domains
  SET likes = likes - 1
  WHERE id = OLD.domain_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER domain_like_removed
AFTER DELETE ON domain_likes
FOR EACH ROW
EXECUTE FUNCTION decrement_domain_likes();

-- User trigger to create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
