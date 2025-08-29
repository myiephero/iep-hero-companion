-- Create meeting_reminders table (only this table is missing)
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

-- Enable RLS on meeting_reminders
ALTER TABLE public.meeting_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for meeting_reminders
CREATE POLICY "Users can view their own meeting reminders" ON public.meeting_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage meeting reminders" ON public.meeting_reminders
  FOR ALL USING (true);

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
DROP TRIGGER IF EXISTS create_meeting_reminders_trigger ON public.meetings;
CREATE TRIGGER create_meeting_reminders_trigger
  AFTER INSERT ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_meeting_reminders();