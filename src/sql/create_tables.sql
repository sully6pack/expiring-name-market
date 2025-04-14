
-- ... keep existing code (users table and other tables creation)

-- Create domains table
CREATE TABLE domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 99.00, -- Default price set to $99
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

-- ... keep existing code (remaining tables creation and RLS policies)
