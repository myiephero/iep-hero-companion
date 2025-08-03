-- Parent Empowerment Tools Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if recreating
DROP TABLE IF EXISTS reminder_emails;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS ai_reviews;

-- Create ai_reviews table (existing data source)
CREATE TABLE ai_reviews (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "keyDates" TEXT[], -- Array of key dates mentioned
  "topConcerns" TEXT[], -- Array of main concerns
  "summaryTrends" TEXT, -- Overall trend analysis
  "reviewDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE goals (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'on_hold')),
  notes TEXT,
  "targetDate" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminders table
CREATE TABLE reminders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "userId" TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'IEP Meeting',
  "meetingDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "reminderDays" INTEGER[] DEFAULT ARRAY[7, 3, 1], -- Days before to send reminders
  "emailSent" BOOLEAN[] DEFAULT ARRAY[false, false, false], -- Track which emails sent
  notes TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reminder_emails table (track email sending)
CREATE TABLE reminder_emails (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "reminderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emailType" TEXT NOT NULL CHECK ("emailType" IN ('7_day', '3_day', '1_day')),
  "sentAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "emailStatus" TEXT DEFAULT 'sent' CHECK ("emailStatus" IN ('sent', 'failed', 'pending')),
  FOREIGN KEY ("reminderId") REFERENCES reminders(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users (replace with actual auth when implemented)
-- For now, allowing all operations for development
CREATE POLICY "Allow all operations" ON ai_reviews FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON goals FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON reminders FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON reminder_emails FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_ai_reviews_user ON ai_reviews("userId");
CREATE INDEX idx_ai_reviews_date ON ai_reviews("reviewDate" DESC);
CREATE INDEX idx_goals_user ON goals("userId");
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_created ON goals("createdAt" DESC);
CREATE INDEX idx_reminders_user ON reminders("userId");
CREATE INDEX idx_reminders_meeting ON reminders("meetingDate" ASC);
CREATE INDEX idx_reminders_active ON reminders("isActive");
CREATE INDEX idx_reminder_emails_reminder ON reminder_emails("reminderId");
CREATE INDEX idx_reminder_emails_user ON reminder_emails("userId");

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers
DROP TRIGGER IF EXISTS update_ai_reviews_timestamp ON ai_reviews;
CREATE TRIGGER update_ai_reviews_timestamp
  BEFORE UPDATE ON ai_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_goals_timestamp ON goals;
CREATE TRIGGER update_goals_timestamp
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_reminders_timestamp ON reminders;
CREATE TRIGGER update_reminders_timestamp
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Insert some sample data for testing
INSERT INTO ai_reviews (id, "userId", title, content, "keyDates", "topConcerns", "summaryTrends", "reviewDate") VALUES
('ai_review_1', 'user_123', 'Q1 IEP Review Analysis', 'Student showing progress in reading comprehension but needs additional support in math problem-solving skills.', 
 ARRAY['2024-03-15', '2024-06-10'], 
 ARRAY['Math Problem Solving', 'Reading Comprehension Support', 'Social Skills Development'], 
 'Overall positive trajectory with specific areas needing focused intervention',
 '2024-03-15T10:00:00Z'),
('ai_review_2', 'user_123', 'Behavioral Assessment Review', 'Improvements noted in classroom behavior and peer interactions. Recommend continued behavioral support strategies.',
 ARRAY['2024-02-28', '2024-05-20'], 
 ARRAY['Classroom Behavior', 'Peer Interactions', 'Attention Span'], 
 'Significant improvement in behavioral metrics over past quarter',
 '2024-02-28T14:30:00Z');

INSERT INTO goals (id, "userId", title, status, notes, "targetDate") VALUES
('goal_1', 'user_123', 'Improve Reading Comprehension to Grade Level', 'in_progress', 'Working with reading specialist twice weekly. Progress noted in vocabulary development.', '2024-06-30T00:00:00Z'),
('goal_2', 'user_123', 'Develop Math Problem-Solving Skills', 'not_started', 'Need to coordinate with math teacher for individualized approach.', '2024-08-15T00:00:00Z'),
('goal_3', 'user_123', 'Enhance Social Communication Skills', 'completed', 'Successfully completed initial social skills program. Ready for advanced level.', '2024-04-01T00:00:00Z');

INSERT INTO reminders (id, "userId", title, "meetingDate", notes) VALUES
('reminder_1', 'user_123', 'Annual IEP Review Meeting', '2024-07-15T10:00:00Z', 'Prepare progress reports and goal assessments. Invite all team members.'),
('reminder_2', 'user_123', 'Quarterly Progress Review', '2024-08-20T14:00:00Z', 'Focus on math goals and behavioral progress updates.');

-- Create a function to check for upcoming reminders (will be called by the application)
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
  reminder_id TEXT,
  user_id TEXT,
  title TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE,
  days_until INTEGER,
  reminder_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as reminder_id,
    r."userId" as user_id,
    r.title,
    r."meetingDate" as meeting_date,
    EXTRACT(DAY FROM r."meetingDate" - NOW())::INTEGER as days_until,
    CASE 
      WHEN EXTRACT(DAY FROM r."meetingDate" - NOW()) <= 1 THEN '1_day'
      WHEN EXTRACT(DAY FROM r."meetingDate" - NOW()) <= 3 THEN '3_day'
      WHEN EXTRACT(DAY FROM r."meetingDate" - NOW()) <= 7 THEN '7_day'
      ELSE 'none'
    END as reminder_type
  FROM reminders r
  WHERE r."isActive" = true
    AND r."meetingDate" > NOW()
    AND EXTRACT(DAY FROM r."meetingDate" - NOW()) <= 7;
END;
$$ LANGUAGE plpgsql;