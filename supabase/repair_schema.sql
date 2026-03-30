-- SCHEMA REPAIR SCRIPT --
-- RUN THIS IN SUPABASE SQL EDITOR --

-- 1. Drop dependent tables temporarily if needed, or just alter types
-- We need to change profile_id in memberships from UUID to TEXT to match Clerk ID

-- First, remove the foreign key constraint
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_profile_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;

-- Second, change the ID types in profiles
ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING clerk_id;

-- Third, change the referencing column types
ALTER TABLE memberships ALTER COLUMN profile_id TYPE TEXT;
ALTER TABLE bookings ALTER COLUMN user_id TYPE TEXT;

-- Finally, restore the constraints
ALTER TABLE memberships ADD CONSTRAINT memberships_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- Ensure RLS Policies are permissive for now
DROP POLICY IF EXISTS "Allow individual profile access" ON profiles;
CREATE POLICY "Allow individual profile access" ON profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow facility access" ON facilities;
CREATE POLICY "Allow facility access" ON facilities FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow membership access" ON memberships;
CREATE POLICY "Allow membership access" ON memberships FOR ALL USING (true);
 
-- Add Support for Point-of-Sale (POS) items on bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bill_items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0;

-- 7. PRODUCTS (INVENTORY)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id TEXT REFERENCES facilities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT, -- 'drink', 'equipment', 'service'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow product access" ON products FOR ALL USING (true);
