-- Add parent_id to students table to link students to their parents/guardians
ALTER TABLE public.students ADD COLUMN parent_id uuid REFERENCES auth.users(id);

-- Create advocate_clients table to track which families an advocate works with
CREATE TABLE public.advocate_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advocate_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type text DEFAULT 'professional',
  status text DEFAULT 'active',
  start_date timestamp with time zone DEFAULT now(),
  end_date timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(advocate_id, client_id)
);

-- Enable RLS on advocate_clients
ALTER TABLE public.advocate_clients ENABLE ROW LEVEL SECURITY;

-- Create policies for advocate_clients
CREATE POLICY "Advocates can view their clients" 
ON public.advocate_clients 
FOR SELECT 
USING (auth.uid() = advocate_id);

CREATE POLICY "Advocates can manage their client relationships" 
ON public.advocate_clients 
FOR ALL 
USING (auth.uid() = advocate_id);

CREATE POLICY "Clients can view their advocate relationships" 
ON public.advocate_clients 
FOR SELECT 
USING (auth.uid() = client_id);

-- Update students table RLS policies to allow advocates to access their clients' students
DROP POLICY IF EXISTS "Users can view their own students" ON public.students;
DROP POLICY IF EXISTS "Users can create students" ON public.students;
DROP POLICY IF EXISTS "Users can update their own students" ON public.students;
DROP POLICY IF EXISTS "Users can delete their own students" ON public.students;

-- New comprehensive policies for students
CREATE POLICY "Parents can manage their own students" 
ON public.students 
FOR ALL 
USING (auth.uid() = user_id OR auth.uid() = parent_id);

CREATE POLICY "Advocates can view clients' students" 
ON public.students 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = parent_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND (client_id = user_id OR client_id = parent_id)
    AND status = 'active'
  )
);

CREATE POLICY "Advocates can manage clients' students" 
ON public.students 
FOR INSERT, UPDATE, DELETE
USING (
  auth.uid() = user_id OR 
  auth.uid() = parent_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND (client_id = user_id OR client_id = parent_id)
    AND status = 'active'
  )
);

-- Add trigger for updated_at on advocate_clients
CREATE TRIGGER update_advocate_clients_updated_at
  BEFORE UPDATE ON public.advocate_clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update other tables to allow advocate access through advocate_clients relationship
-- Update accommodations policies
DROP POLICY IF EXISTS "Users can manage their own accommodations" ON public.accommodations;

CREATE POLICY "Users can manage their own accommodations" 
ON public.accommodations 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update autism_accommodations policies  
DROP POLICY IF EXISTS "Users can manage their own autism accommodations" ON public.autism_accommodations;

CREATE POLICY "Users can manage their own autism accommodations" 
ON public.autism_accommodations 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update gifted_assessments policies
DROP POLICY IF EXISTS "Users can manage their own gifted assessments" ON public.gifted_assessments;

CREATE POLICY "Users can manage their own gifted assessments" 
ON public.gifted_assessments 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update goals policies
DROP POLICY IF EXISTS "Users can manage their own goals" ON public.goals;

CREATE POLICY "Users can manage their own goals" 
ON public.goals 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update letters policies
DROP POLICY IF EXISTS "Users can manage their own letters" ON public.letters;

CREATE POLICY "Users can manage their own letters" 
ON public.letters 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update meetings policies
DROP POLICY IF EXISTS "Users can manage their own meetings" ON public.meetings;

CREATE POLICY "Users can manage their own meetings" 
ON public.meetings 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update services policies
DROP POLICY IF EXISTS "Users can manage their own services" ON public.services;

CREATE POLICY "Users can manage their own services" 
ON public.services 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update documents policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

CREATE POLICY "Users can manage their own documents" 
ON public.documents 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);

-- Update ai_reviews policies
DROP POLICY IF EXISTS "Users can manage their own AI reviews" ON public.ai_reviews;

CREATE POLICY "Users can manage their own AI reviews" 
ON public.ai_reviews 
FOR ALL 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.advocate_clients 
    WHERE advocate_id = auth.uid() 
    AND client_id = user_id
    AND status = 'active'
  )
);