-- First, drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a better policy for inserting profiles
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- This will allow authenticated users to insert their own profile data once they're logged in
-- The trigger function will bypass RLS due to SECURITY DEFINER