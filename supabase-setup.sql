-- MathU Database Setup
-- Run this in the Supabase SQL Editor

-- Profiles table (stores user accounts)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT NOT NULL,
  year TEXT,
  topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Stats table (stores game progress per user)
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  total_attempted INTEGER DEFAULT 0,
  fastest_time INTEGER DEFAULT 0,
  no_hint_streak INTEGER DEFAULT 0,
  correct_streak INTEGER DEFAULT 0,
  topic_stats JSONB DEFAULT '{}'::jsonb,
  earned_badges JSONB DEFAULT '[]'::jsonb,
  daily_completed BOOLEAN DEFAULT false,
  last_daily_date DATE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for now (we'll tighten this later with proper auth)
CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update profiles" ON profiles FOR UPDATE USING (true);

CREATE POLICY "Allow public read stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert stats" ON user_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update stats" ON user_stats FOR UPDATE USING (true);

-- Index for fast phone lookups
CREATE INDEX idx_profiles_phone ON profiles(phone);
