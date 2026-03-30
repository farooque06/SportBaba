-- Add Guest Details to Bookings Table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status check to be more flexible if needed (optional)
-- ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;
-- ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'paid'));
