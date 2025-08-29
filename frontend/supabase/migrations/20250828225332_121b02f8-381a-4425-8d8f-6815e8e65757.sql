-- Fix the RLS policy issue by creating a better policy that handles the trigger context
-- Drop and recreate the INSERT policy to handle both authenticated users and the trigger function
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a policy that allows both authenticated users and the trigger function
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if the user is authenticated and inserting their own data
  auth.uid() = user_id 
  OR 
  -- Allow if this is coming from the trigger (no authenticated user yet)
  auth.uid() IS NULL
);