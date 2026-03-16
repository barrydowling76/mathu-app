-- ============================================
-- MathU Parent Dashboard - Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Question attempts table (logs every individual attempt)
CREATE TABLE question_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL,
  hints_used INTEGER DEFAULT 0,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add role and parent linking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parent_of UUID REFERENCES profiles(id);

-- 3. RLS and policies for question_attempts
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read question_attempts" ON question_attempts FOR SELECT USING (true);
CREATE POLICY "Allow public insert question_attempts" ON question_attempts FOR INSERT WITH CHECK (true);

-- 4. Indexes for fast dashboard queries
CREATE INDEX idx_attempts_user ON question_attempts(user_id);
CREATE INDEX idx_attempts_date ON question_attempts(attempted_at);
CREATE INDEX idx_attempts_topic ON question_attempts(topic);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_parent ON profiles(parent_of);
