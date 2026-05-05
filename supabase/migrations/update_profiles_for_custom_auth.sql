-- Update profiles table for custom auth
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE profiles ALTER COLUMN clerk_id DROP NOT EXISTS;

-- Optional: If you want to use the email as the unique identifier for auth
-- but still keep UUID as primary key, ensure email is unique (already is).

-- Update memberships to use user_id if it was named profile_id
-- In your schema.sql it is named profile_id, but in your code you used user_id.
-- Let's check memberships table.
