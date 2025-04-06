
-- This file contains SQL commands to run in the Supabase SQL Editor to create an admin user

-- IMPORTANT: These commands should be run AFTER you've set up your Supabase project and
-- configured the connection in your application.

-- OPTION 1: Create a new admin user (recommended for new projects)
-- Step 1: First sign up the user through Supabase Auth UI or API with:
--    Email: admin@notrenewing.com
--    Password: admin123

-- Step 2: Then run this SQL to make the user an admin:
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'admin@notrenewing.com';

-- OPTION 2: Make an existing user an admin
-- Update any existing user to be an admin by email:
-- UPDATE public.users
-- SET is_admin = TRUE
-- WHERE email = 'your-existing-user@example.com';

-- Verification query to check if admin exists:
SELECT id, email, name, is_admin FROM public.users WHERE is_admin = TRUE;

-- TROUBLESHOOTING:
-- If you're having trouble connecting to Supabase:
-- 1. Make sure your Supabase URL and anon key are correctly set in your environment variables
-- 2. Check that the users table exists in your database
-- 3. Verify RLS (Row Level Security) policies aren't blocking the operation
