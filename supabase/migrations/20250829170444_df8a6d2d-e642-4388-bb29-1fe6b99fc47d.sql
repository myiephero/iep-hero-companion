-- CRITICAL SECURITY FIXES

-- Fix 1: Restrict advocate profile access (CRITICAL PRIVACY FIX)
-- Remove overly permissive policy that exposes all advocate data
DROP POLICY IF EXISTS "Advocates can view all advocate profiles" ON public.advocates;

-- Create more restrictive policies for advocate profiles
-- Only allow viewing advocate profiles in legitimate business scenarios
CREATE POLICY "Users can view advocate profiles for requests" 
ON public.advocates 
FOR SELECT 
USING (
  -- Allow viewing during advocate search/discovery
  -- or if there's an active client relationship
  auth.uid() IS NOT NULL AND (
    -- User has an active advocate request with this advocate
    EXISTS (
      SELECT 1 FROM public.advocate_requests 
      WHERE advocate_id = advocates.user_id 
      AND parent_id = auth.uid()
    )
    OR
    -- User has an active advocate-client relationship
    EXISTS (
      SELECT 1 FROM public.advocate_clients 
      WHERE advocate_id = advocates.user_id 
      AND client_id = auth.uid() 
      AND status = 'active'
    )
    OR
    -- The advocate is viewing their own profile
    auth.uid() = advocates.user_id
  )
);

-- Fix 2: Restrict meeting reminders access (CRITICAL PRIVACY FIX)
-- Remove overly permissive system policy
DROP POLICY IF EXISTS "System can manage meeting reminders" ON public.meeting_reminders;

-- Create proper user-scoped policies for meeting reminders
CREATE POLICY "Users can view their meeting reminders" 
ON public.meeting_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their meeting reminders" 
ON public.meeting_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow system processes to insert/update reminders (for automated functions)
-- But restrict to service role only
CREATE POLICY "Service role can manage meeting reminders" 
ON public.meeting_reminders 
FOR ALL 
USING (
  -- Only allow service role (edge functions) to manage reminders
  current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
);

-- Fix 3: Update database functions with proper search_path (SECURITY HARDENING)
-- These functions currently have search path vulnerabilities

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, full_name, email, role)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'parent')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_student_access(student_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() = student_user_id AND auth.uid() IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.log_student_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to students table for audit purposes
  INSERT INTO public.audit_log (
    table_name,
    record_id,
    action,
    user_id,
    timestamp
  ) VALUES (
    'students',
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    auth.uid(),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_meeting_reminders()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create reminders for 7 days, 3 days, and 1 day before meeting
  INSERT INTO public.meeting_reminders (meeting_id, user_id, reminder_days)
  VALUES 
    (NEW.id, NEW.user_id, 7),
    (NEW.id, NEW.user_id, 3),
    (NEW.id, NEW.user_id, 1);
  
  RETURN NEW;
END;
$$;