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

-- Friends table
CREATE TABLE friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Daily challenge results
CREATE TABLE daily_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  correct BOOLEAN NOT NULL,
  time_taken INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_date)
);

-- Enable Row Level Security for new tables
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_results ENABLE ROW LEVEL SECURITY;

-- Create policies for friends table
CREATE POLICY "Allow public read friends" ON friends FOR SELECT USING (true);
CREATE POLICY "Allow public insert friends" ON friends FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete friends" ON friends FOR DELETE USING (true);

-- Create policies for daily_results table
CREATE POLICY "Allow public read daily_results" ON daily_results FOR SELECT USING (true);
CREATE POLICY "Allow public insert daily_results" ON daily_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update daily_results" ON daily_results FOR UPDATE USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_friends_user ON friends(user_id);
CREATE INDEX idx_friends_friend ON friends(friend_id);
CREATE INDEX idx_daily_results_date ON daily_results(challenge_date);
CREATE INDEX idx_daily_results_user ON daily_results(user_id);
