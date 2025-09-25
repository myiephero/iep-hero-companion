-- IEP Hero Complete Database Schema for Supabase
-- This creates all tables with proper Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Users table - extends Supabase auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    role VARCHAR DEFAULT 'parent',
    email_verified BOOLEAN DEFAULT false,
    subscription_status VARCHAR,
    subscription_plan VARCHAR,
    stripe_customer_id VARCHAR,
    stripe_subscription_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own record
CREATE POLICY "Users can view own record" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own record" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Students table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID,
    full_name VARCHAR NOT NULL,
    date_of_birth VARCHAR,
    grade_level VARCHAR,
    school_name VARCHAR,
    district VARCHAR,
    case_manager VARCHAR,
    case_manager_email VARCHAR,
    disability_category VARCHAR,
    iep_date VARCHAR,
    iep_status VARCHAR,
    iep_workflow_stage VARCHAR DEFAULT 'referral',
    next_review_date VARCHAR,
    emergency_contact VARCHAR,
    emergency_phone VARCHAR,
    medical_info TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on students table
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Users can only see their own students
CREATE POLICY "Users can view own students" ON public.students
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own students" ON public.students
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own students" ON public.students
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own students" ON public.students
    FOR DELETE USING (auth.uid() = user_id);

-- Documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    file_name VARCHAR NOT NULL,
    file_path VARCHAR NOT NULL,
    file_type VARCHAR,
    file_size INTEGER,
    category VARCHAR,
    tags JSONB,
    content TEXT,
    confidential BOOLEAN,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can only see their own documents
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON public.documents
    FOR DELETE USING (auth.uid() = user_id);

-- Goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    goal_type VARCHAR,
    status VARCHAR,
    target_date VARCHAR,
    current_progress INTEGER,
    measurable_criteria VARCHAR,
    data_collection JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own goals
CREATE POLICY "Users can view own goals" ON public.goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
    FOR DELETE USING (auth.uid() = user_id);

-- Autism accommodations table
CREATE TABLE public.autism_accommodations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR NOT NULL,
    accommodation_type VARCHAR NOT NULL,
    implementation_notes TEXT,
    effectiveness_rating INTEGER,
    status VARCHAR,
    sensory_profile JSONB,
    communication_needs JSONB,
    social_supports JSONB,
    academic_supports JSONB,
    behavioral_triggers JSONB,
    environmental_modifications JSONB,
    technology_supports JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on autism_accommodations table
ALTER TABLE public.autism_accommodations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own accommodations
CREATE POLICY "Users can view own accommodations" ON public.autism_accommodations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accommodations" ON public.autism_accommodations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accommodations" ON public.autism_accommodations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accommodations" ON public.autism_accommodations
    FOR DELETE USING (auth.uid() = user_id);

-- Advocates table
CREATE TABLE public.advocates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    bio TEXT,
    location VARCHAR,
    specializations JSONB,
    certifications JSONB,
    education VARCHAR,
    years_experience INTEGER,
    languages JSONB,
    case_types JSONB,
    rate_per_hour INTEGER,
    availability VARCHAR,
    rating INTEGER,
    total_reviews INTEGER,
    verification_status VARCHAR,
    status VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on advocates table
ALTER TABLE public.advocates ENABLE ROW LEVEL SECURITY;

-- Advocates can see their own profile, parents can see all advocates
CREATE POLICY "Advocates can view own profile" ON public.advocates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Parents can view all advocates" ON public.advocates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'parent'
        )
    );

CREATE POLICY "Advocates can insert own profile" ON public.advocates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advocates can update own profile" ON public.advocates
    FOR UPDATE USING (auth.uid() = user_id);

-- AI Reviews table
CREATE TABLE public.ai_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    review_type VARCHAR NOT NULL,
    ai_analysis JSONB NOT NULL,
    strengths JSONB,
    areas_of_concern JSONB,
    recommendations JSONB,
    suggested_improvements JSONB,
    action_items JSONB,
    compliance_score INTEGER,
    priority_level VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on ai_reviews table
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;

-- Users can only see their own AI reviews
CREATE POLICY "Users can view own ai_reviews" ON public.ai_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_reviews" ON public.ai_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_reviews" ON public.ai_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_reviews" ON public.ai_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Meetings table
CREATE TABLE public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title VARCHAR NOT NULL,
    description TEXT,
    meeting_type VARCHAR,
    scheduled_date VARCHAR NOT NULL,
    duration INTEGER,
    location VARCHAR,
    agenda JSONB,
    attendees JSONB,
    outcomes TEXT,
    follow_up_actions JSONB,
    notes TEXT,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on meetings table
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own meetings
CREATE POLICY "Users can view own meetings" ON public.meetings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON public.meetings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON public.meetings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON public.meetings
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_autism_accommodations_user_id ON public.autism_accommodations(user_id);
CREATE INDEX idx_advocates_user_id ON public.advocates(user_id);
CREATE INDEX idx_ai_reviews_user_id ON public.ai_reviews(user_id);
CREATE INDEX idx_meetings_user_id ON public.meetings(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_autism_accommodations_updated_at
    BEFORE UPDATE ON public.autism_accommodations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_advocates_updated_at
    BEFORE UPDATE ON public.advocates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_ai_reviews_updated_at
    BEFORE UPDATE ON public.ai_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_meetings_updated_at
    BEFORE UPDATE ON public.meetings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();