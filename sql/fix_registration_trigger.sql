-- Since you mentioned earlier that there is no `profiles` table but you are 
-- encountering a "Database error saving new user" during registration, 
-- it is highly likely that there is a leftover DB trigger trying to insert 
-- new users into a deleted `profiles` table.

-- Run this snippet in your Supabase SQL Editor to clean up any leftover triggers:

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
