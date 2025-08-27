-- My IEP Hero - Advocate Matching System Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_parent_of(user_id UUID, student_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.students s 
    WHERE s.id = student_id AND s.parent_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Core user profiles table (assumed to exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'advocate', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
  needs TEXT[] DEFAULT '{}', -- Manual tags like ['autism', 'speech', 'ot']
  languages TEXT[] DEFAULT '{"en"}',
  timezone TEXT DEFAULT 'America/New_York',
  budget DECIMAL(10,2),
  narrative TEXT, -- Free-text description for LLM tag extraction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advocate profiles table
CREATE TABLE IF NOT EXISTS public.advocate_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}', -- Specialties like ['autism', 'speech', 'ot']
  languages TEXT[] DEFAULT '{"en"}',
  timezone TEXT DEFAULT 'America/New_York',
  hourly_rate DECIMAL(10,2),
  max_caseload INTEGER DEFAULT 10,
  availability JSONB DEFAULT '{}', -- Flexible availability data
  bio TEXT,
  experience_years INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match proposals table
CREATE TABLE IF NOT EXISTS public.match_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES public.advocate_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'proposed' 
    CHECK (status IN ('proposed', 'intro_requested', 'scheduled', 'accepted', 'declined')),
  score DECIMAL(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  reason JSONB DEFAULT '{}', -- Matching reasons and score breakdown
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match events for audit trail
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES public.match_proposals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'proposal_created', 'intro_requested', 'intro_scheduled', 
    'proposal_accepted', 'proposal_declined'
  )),
  actor_id UUID NOT NULL REFERENCES public.profiles(id),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intro calls table
CREATE TABLE IF NOT EXISTS public.intro_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES public.match_proposals(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  channel TEXT DEFAULT 'zoom' CHECK (channel IN ('zoom', 'phone', 'google_meet')),
  meeting_link TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  proposal_id UUID REFERENCES public.match_proposals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments table (existing relationships)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advocate_id UUID NOT NULL REFERENCES public.advocate_profiles(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(advocate_id, parent_id)
);

-- Row Level Security Policies

-- Students policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_own_or_admin" ON public.students;
CREATE POLICY "students_own_or_admin" ON public.students
FOR ALL USING (
  parent_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Advocate profiles policies  
ALTER TABLE public.advocate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advocate_profiles_viewable" ON public.advocate_profiles;
CREATE POLICY "advocate_profiles_viewable" ON public.advocate_profiles
FOR SELECT USING (TRUE); -- All users can view advocate profiles

DROP POLICY IF EXISTS "advocate_profiles_own_or_admin" ON public.advocate_profiles;
CREATE POLICY "advocate_profiles_own_or_admin" ON public.advocate_profiles
FOR INSERT, UPDATE, DELETE USING (
  id = auth.uid() OR public.is_admin(auth.uid())
);

-- Match proposals policies
ALTER TABLE public.match_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_proposals_visible" ON public.match_proposals;
CREATE POLICY "match_proposals_visible" ON public.match_proposals
FOR SELECT USING (
  public.is_parent_of(auth.uid(), student_id) 
  OR advocate_id = auth.uid()
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "match_proposals_create" ON public.match_proposals;
CREATE POLICY "match_proposals_create" ON public.match_proposals
FOR INSERT WITH CHECK (
  (public.is_parent_of(auth.uid(), student_id) AND created_by = auth.uid())
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "match_proposals_update" ON public.match_proposals;
CREATE POLICY "match_proposals_update" ON public.match_proposals
FOR UPDATE USING (
  public.is_parent_of(auth.uid(), student_id)
  OR advocate_id = auth.uid()
  OR public.is_admin(auth.uid())
);

-- Match events policies
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_events_visible" ON public.match_events;
CREATE POLICY "match_events_visible" ON public.match_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.match_proposals mp
    WHERE mp.id = proposal_id AND (
      public.is_parent_of(auth.uid(), mp.student_id)
      OR mp.advocate_id = auth.uid()
      OR public.is_admin(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "match_events_create" ON public.match_events;
CREATE POLICY "match_events_create" ON public.match_events
FOR INSERT WITH CHECK (
  actor_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Intro calls policies
ALTER TABLE public.intro_calls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "intro_calls_visible" ON public.intro_calls;
CREATE POLICY "intro_calls_visible" ON public.intro_calls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.match_proposals mp
    WHERE mp.id = proposal_id AND (
      public.is_parent_of(auth.uid(), mp.student_id)
      OR mp.advocate_id = auth.uid()
      OR public.is_admin(auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "intro_calls_create" ON public.intro_calls;
CREATE POLICY "intro_calls_create" ON public.intro_calls
FOR INSERT WITH CHECK (
  created_by = auth.uid() OR public.is_admin(auth.uid())
);

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
CREATE POLICY "notifications_own" ON public.notifications
FOR ALL USING (
  user_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Assignments policies
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assignments_visible" ON public.assignments;
CREATE POLICY "assignments_visible" ON public.assignments
FOR SELECT USING (
  advocate_id = auth.uid()
  OR parent_id = auth.uid() 
  OR public.is_admin(auth.uid())
);

DROP POLICY IF EXISTS "assignments_create" ON public.assignments;
CREATE POLICY "assignments_create" ON public.assignments
FOR INSERT WITH CHECK (
  advocate_id = auth.uid() OR public.is_admin(auth.uid())
);

-- Profiles policies (basic)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_viewable" ON public.profiles;
CREATE POLICY "profiles_viewable" ON public.profiles
FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "profiles_own" ON public.profiles;  
CREATE POLICY "profiles_own" ON public.profiles
FOR INSERT, UPDATE, DELETE USING (
  id = auth.uid() OR public.is_admin(auth.uid())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS students_parent_id_idx ON public.students(parent_id);
CREATE INDEX IF NOT EXISTS match_proposals_student_id_idx ON public.match_proposals(student_id);
CREATE INDEX IF NOT EXISTS match_proposals_advocate_id_idx ON public.match_proposals(advocate_id);
CREATE INDEX IF NOT EXISTS match_proposals_status_idx ON public.match_proposals(status);
CREATE INDEX IF NOT EXISTS match_events_proposal_id_idx ON public.match_events(proposal_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_read_idx ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS advocate_profiles_tags_gin_idx ON public.advocate_profiles USING GIN (tags);
CREATE INDEX IF NOT EXISTS students_needs_gin_idx ON public.students USING GIN (needs);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_students_updated_at ON public.students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_advocate_profiles_updated_at ON public.advocate_profiles;
CREATE TRIGGER update_advocate_profiles_updated_at
  BEFORE UPDATE ON public.advocate_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_match_proposals_updated_at ON public.match_proposals;
CREATE TRIGGER update_match_proposals_updated_at
  BEFORE UPDATE ON public.match_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();