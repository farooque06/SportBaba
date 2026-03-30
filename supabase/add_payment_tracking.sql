-- Add Payment Tracking to Bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial')),
ADD COLUMN IF NOT EXISTS payment_method TEXT NULL CHECK (payment_method IN ('cash', 'card', 'khalti', 'esewa', 'other'));

-- Update existing bookings to unpaid if needed
UPDATE bookings SET payment_status = 'unpaid' WHERE payment_status IS NULL;
