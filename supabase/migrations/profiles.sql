-- SportBaba: User Profiles Migration
-- This table syncs with Clerk User metadata to provide a fast local reference for names/avatars/emails.

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Clerk User ID (e.g. user_2p...)
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add role column if it doesn't exist (for existing tables)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Basic RLS (Allow users to see all profiles in the same facility context if needed, 
-- but for now, we keep it simple since we use service_role for sync)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id);

-- Superadmin bypass (if using Supabase Auth, but we use Clerk)
-- CREATE POLICY "Admins can view all" ON profiles ...
