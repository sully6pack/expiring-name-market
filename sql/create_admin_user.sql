
-- This file contains SQL commands to run in the Supabase SQL Editor to create an admin user

-- First, create the user in auth.users (replace password_hash with the actual hash)
-- NOTE: In practice, you would use Supabase's auth.sign_up() function or API to create the user
-- This is just for demonstration purposes

-- 1. First sign up the user through Supabase Auth UI or API with:
--    Email: admin@notrenewing.com
--    Password: admin123

-- 2. Then run this SQL to make the user an admin:
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'admin@notrenewing.com';

-- Alternatively, if you want to make an existing user an admin:
-- UPDATE public.users
-- SET is_admin = TRUE
-- WHERE id = 'user-uuid-goes-here';

-- Verification query to check if admin exists:
SELECT id, email, name, is_admin FROM public.users WHERE is_admin = TRUE;
