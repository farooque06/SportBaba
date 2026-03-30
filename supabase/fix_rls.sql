-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. PROFILES POLICIES
-- Allow all authenticated users to read and insert their own profile
CREATE POLICY "Allow individual profile access" ON profiles FOR ALL USING (true);

-- 2. FACILITIES POLICIES
-- Allow all authenticated users to manage facilities
CREATE POLICY "Allow facility access" ON facilities FOR ALL USING (true);

-- 3. MEMBERSHIPS POLICIES
CREATE POLICY "Allow membership access" ON memberships FOR ALL USING (true);

-- 4. RESOURCE UNITS POLICIES
CREATE POLICY "Allow resource access" ON resource_units FOR ALL USING (true);

-- 5. BOOKINGS POLICIES
CREATE POLICY "Allow booking access" ON bookings FOR ALL USING (true);

-- Make sure RLS is actually ALLOWING these
-- Since we are in development, it's better to start with permissive policies 
-- and tighten them later with Auth checking.
