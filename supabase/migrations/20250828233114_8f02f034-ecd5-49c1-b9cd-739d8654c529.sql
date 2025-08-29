-- Fix critical security vulnerability: Anonymous users can create fake profiles
-- Remove the NULL auth condition from profiles insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enhance security for the students table with additional protections
-- Add function to validate student data access
CREATE OR REPLACE FUNCTION public.validate_student_access(student_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() = student_user_id AND auth.uid() IS NOT NULL;
$$;

-- Update students table policies to use the validation function for extra security
DROP POLICY IF EXISTS "Users can view their own students" ON public.students;
DROP POLICY IF EXISTS "Users can create students" ON public.students;
DROP POLICY IF EXISTS "Users can update their own students" ON public.students;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.students;

-- Recreate policies with enhanced validation
CREATE POLICY "Users can view their own students"
ON public.students
FOR SELECT
USING (public.validate_student_access(user_id));

CREATE POLICY "Users can create students"
ON public.students
FOR INSERT
WITH CHECK (public.validate_student_access(user_id));

CREATE POLICY "Users can update their own students"
ON public.students
FOR UPDATE
USING (public.validate_student_access(user_id));

CREATE POLICY "Users can delete their own students"
ON public.students
FOR DELETE
USING (public.validate_student_access(user_id));

-- Create audit log table for tracking access to sensitive data (if not exists)
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  user_id uuid,
  timestamp timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Audit logs are protected" ON public.audit_log;
CREATE POLICY "Audit logs are protected"
ON public.audit_log
FOR ALL
USING (false);

-- Add audit logging function for sensitive student data access
CREATE OR REPLACE FUNCTION public.log_student_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for audit logging on students table
DROP TRIGGER IF EXISTS audit_students_access ON public.students;
CREATE TRIGGER audit_students_access
  AFTER INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.log_student_access();