-- Fix exclusion constraint to allow rebooking cancelled slots
-- The old constraint blocks inserts even when the conflicting booking is cancelled

-- Step 1: Drop the existing constraint that doesn't account for cancelled bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_resource_id_tstzrange_excl;

-- Step 2: Recreate with a WHERE clause that excludes cancelled bookings
-- This requires the btree_gist extension (should already exist)
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings ADD CONSTRAINT bookings_resource_id_tstzrange_excl
  EXCLUDE USING gist (
    resource_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status != 'cancelled');
