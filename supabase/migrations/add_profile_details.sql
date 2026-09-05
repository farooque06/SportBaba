-- Add extended profile detail columns to profiles table
-- These fields enhance player registration with contact and personal info

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_sport TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- Optional: Add check constraint for preferred_sport values
-- ALTER TABLE profiles ADD CONSTRAINT profiles_preferred_sport_check
--   CHECK (preferred_sport IS NULL OR preferred_sport IN ('football', 'cricket', 'basketball', 'badminton', 'other'));
