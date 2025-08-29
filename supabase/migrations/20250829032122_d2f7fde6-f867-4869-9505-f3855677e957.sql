-- Create meetings table for IEP meeting scheduling
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  student_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT DEFAULT 'iep',
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60,
  location TEXT,
  attendees JSONB,
  agenda JSONB,
  notes TEXT,
  outcomes TEXT,
  follow_up_actions JSONB,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create goals table for IEP goal tracking
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_type TEXT,
  measurable_criteria TEXT,
  target_date DATE,
  current_progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  data_collection JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create meeting_reminders table for email automation
CREATE TABLE IF NOT EXISTS public.meeting_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_days INTEGER NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_content TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meetings
CREATE POLICY "Users can manage their own meetings" ON public.meetings
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for goals
CREATE POLICY "Users can manage their own goals" ON public.goals
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for meeting_reminders
CREATE POLICY "Users can view their own meeting reminders" ON public.meeting_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage meeting reminders" ON public.meeting_reminders
  FOR ALL USING (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create meeting reminders
CREATE OR REPLACE FUNCTION public.create_meeting_reminders()
RETURNS TRIGGER AS $$
BEGIN
  -- Create reminders for 7 days, 3 days, and 1 day before meeting
  INSERT INTO public.meeting_reminders (meeting_id, user_id, reminder_days)
  VALUES 
    (NEW.id, NEW.user_id, 7),
    (NEW.id, NEW.user_id, 3),
    (NEW.id, NEW.user_id, 1);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create reminders when meetings are scheduled
CREATE TRIGGER create_meeting_reminders_trigger
  AFTER INSERT ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_meeting_reminders();