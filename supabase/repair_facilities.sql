-- 1. Drop relying foreign keys
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_facility_id_fkey;
ALTER TABLE resource_units DROP CONSTRAINT IF EXISTS resource_units_facility_id_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_facility_id_fkey;
ALTER TABLE tournaments DROP CONSTRAINT IF EXISTS tournaments_facility_id_fkey;

-- 2. Change the main ID column definition
ALTER TABLE facilities ALTER COLUMN id DROP DEFAULT;
ALTER TABLE facilities ALTER COLUMN id TYPE TEXT;

-- 3. Change all referencing columns to TEXT
ALTER TABLE memberships ALTER COLUMN facility_id TYPE TEXT;
ALTER TABLE resource_units ALTER COLUMN facility_id TYPE TEXT;
ALTER TABLE bookings ALTER COLUMN facility_id TYPE TEXT;
ALTER TABLE tournaments ALTER COLUMN facility_id TYPE TEXT;

-- 4. Re-add foreign keys
ALTER TABLE memberships ADD CONSTRAINT memberships_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
ALTER TABLE resource_units ADD CONSTRAINT resource_units_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD CONSTRAINT bookings_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
ALTER TABLE tournaments ADD CONSTRAINT tournaments_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE;
