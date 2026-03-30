-- Add status column to handle organization approval logic
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Backfill existing facilities as active so they aren't blocked
UPDATE facilities SET status = 'active' WHERE status IS NULL;

-- Create an index to quickly lookup facilities by status
CREATE INDEX IF NOT EXISTS idx_facilities_status ON facilities(status);
