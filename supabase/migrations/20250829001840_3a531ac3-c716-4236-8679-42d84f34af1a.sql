-- Create advocates table for Advocate Matching Tool
CREATE TABLE public.advocates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  specializations TEXT[],
  years_experience INTEGER,
  education TEXT,
  certifications TEXT[],
  rate_per_hour DECIMAL(10,2),
  availability TEXT,
  bio TEXT,
  profile_image_url TEXT,
  languages TEXT[],
  case_types TEXT[],
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create advocate_requests table for connection requests
CREATE TABLE public.advocate_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advocate_id UUID NOT NULL REFERENCES public.advocates(user_id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'medium' CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
  preferred_contact_method TEXT DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'video', 'in_person')),
  budget_range TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  response_message TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create autism_accommodations table for Autism Accommodation Builder
CREATE TABLE public.autism_accommodations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  accommodation_type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_notes TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  sensory_profile JSONB,
  behavioral_triggers JSONB,
  communication_needs JSONB,
  academic_supports JSONB,
  social_supports JSONB,
  environmental_modifications JSONB,
  technology_supports JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial', 'discontinued')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ai_reviews table for IEP Upload AI Review
CREATE TABLE public.ai_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL CHECK (review_type IN ('iep', 'accommodation', 'meeting_prep', 'goal_analysis', 'compliance_check')),
  ai_analysis JSONB NOT NULL,
  recommendations JSONB,
  compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
  areas_of_concern JSONB,
  strengths JSONB,
  suggested_improvements JSONB,
  action_items JSONB,
  priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gifted_assessments table for Gifted 2e Learners Tool
CREATE TABLE public.gifted_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('cognitive', 'academic', 'creative', 'leadership', 'artistic', 'twice_exceptional')),
  giftedness_areas TEXT[] NOT NULL,
  learning_differences TEXT[],
  strengths JSONB NOT NULL,
  challenges JSONB,
  recommendations JSONB,
  acceleration_needs JSONB,
  enrichment_activities JSONB,
  social_emotional_needs JSONB,
  twice_exceptional_profile JSONB,
  assessment_scores JSONB,
  evaluator_notes TEXT,
  next_steps JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'under_review')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.advocates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advocate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autism_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifted_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for advocates table
CREATE POLICY "Advocates can view all advocate profiles" 
ON public.advocates FOR SELECT USING (true);

CREATE POLICY "Users can create their own advocate profile" 
ON public.advocates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advocate profile" 
ON public.advocates FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advocate profile" 
ON public.advocates FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for advocate_requests table
CREATE POLICY "Users can view their own advocate requests" 
ON public.advocate_requests FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Advocates can view requests sent to them" 
ON public.advocate_requests FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.advocates WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create advocate requests" 
ON public.advocate_requests FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update their own requests" 
ON public.advocate_requests FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Advocates can update requests sent to them" 
ON public.advocate_requests FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.advocates WHERE user_id = auth.uid())
);

-- Create RLS policies for autism_accommodations table
CREATE POLICY "Users can manage their own autism accommodations" 
ON public.autism_accommodations FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for ai_reviews table
CREATE POLICY "Users can manage their own AI reviews" 
ON public.ai_reviews FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for gifted_assessments table
CREATE POLICY "Users can manage their own gifted assessments" 
ON public.gifted_assessments FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_advocates_location ON public.advocates(location);
CREATE INDEX idx_advocates_specializations ON public.advocates USING GIN(specializations);
CREATE INDEX idx_advocates_status ON public.advocates(status);
CREATE INDEX idx_advocate_requests_parent ON public.advocate_requests(parent_id);
CREATE INDEX idx_advocate_requests_advocate ON public.advocate_requests(advocate_id);
CREATE INDEX idx_advocate_requests_status ON public.advocate_requests(status);
CREATE INDEX idx_autism_accommodations_student ON public.autism_accommodations(student_id);
CREATE INDEX idx_autism_accommodations_category ON public.autism_accommodations(category);
CREATE INDEX idx_ai_reviews_document ON public.ai_reviews(document_id);
CREATE INDEX idx_ai_reviews_type ON public.ai_reviews(review_type);
CREATE INDEX idx_gifted_assessments_student ON public.gifted_assessments(student_id);
CREATE INDEX idx_gifted_assessments_type ON public.gifted_assessments(assessment_type);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_advocates_updated_at
BEFORE UPDATE ON public.advocates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advocate_requests_updated_at
BEFORE UPDATE ON public.advocate_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_autism_accommodations_updated_at
BEFORE UPDATE ON public.autism_accommodations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_reviews_updated_at
BEFORE UPDATE ON public.ai_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gifted_assessments_updated_at
BEFORE UPDATE ON public.gifted_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();