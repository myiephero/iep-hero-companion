-- COMPREHENSIVE SECURITY FIX FOR CRITICAL PRIVACY VULNERABILITIES

-- Fix 1: Completely secure the advocates table (CRITICAL PRIVACY FIX)
-- Drop all existing policies that might be too permissive
DROP POLICY IF EXISTS "Users can view advocate profiles for requests" ON public.advocates;
DROP POLICY IF EXISTS "Advocates can view all advocate profiles" ON public.advocates;

-- Create secure advocate profile policies
-- Only allow viewing advocate profiles in very specific legitimate scenarios
CREATE POLICY "Restricted advocate profile access" 
ON public.advocates 
FOR SELECT 
USING (
  -- Advocates can view their own profile
  auth.uid() = user_id
  OR
  -- Parents can view advocates they have active requests with
  EXISTS (
    SELECT 1 FROM public.advocate_requests 
    WHERE advocate_id = advocates.user_id 
    AND parent_id = auth.uid()
    AND status IN ('pending', 'accepted')
  )
  OR
  -- Clients can view advocates they have active relationships with
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = advocates.user_id 
    AND client_id = auth.uid() 
    AND status = 'active'
  )
);

-- Fix 2: Completely secure the advocate_requests table (CRITICAL PRIVACY FIX)
-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Advocates can view requests sent to them" ON public.advocate_requests;
DROP POLICY IF EXISTS "Advocates can update requests sent to them" ON public.advocate_requests;

-- Create secure advocate request policies
-- Only allow the parent who created the request and the specific advocate to access
CREATE POLICY "Secure advocate request access" 
ON public.advocate_requests 
FOR SELECT 
USING (
  -- Parent who created the request can view it
  auth.uid() = parent_id
  OR
  -- Only the specific advocate the request was sent to can view it
  advocate_id IN (
    SELECT user_id FROM public.advocates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Secure advocate request updates" 
ON public.advocate_requests 
FOR UPDATE 
USING (
  -- Parent who created the request can update it
  auth.uid() = parent_id
  OR
  -- Only the specific advocate the request was sent to can update it (e.g., respond)
  advocate_id IN (
    SELECT user_id FROM public.advocates WHERE user_id = auth.uid()
  )
);

-- Fix 3: Ensure meeting reminders are properly secured
-- Update the service role policy to be more specific
DROP POLICY IF EXISTS "Service role can manage meeting reminders" ON public.meeting_reminders;

CREATE POLICY "Restricted service role meeting reminders" 
ON public.meeting_reminders 
FOR ALL 
USING (
  -- Allow service role for automated reminder functions only
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  OR
  -- Allow users to manage their own reminders
  auth.uid() = user_id
);