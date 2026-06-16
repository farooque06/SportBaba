-- Add subscription_end column to track facility subscription expiry
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMP WITH TIME ZONE;

-- Backfill existing active facilities with a 1-year subscription to prevent immediate lockouts
UPDATE facilities 
SET subscription_end = NOW() + INTERVAL '1 year' 
WHERE subscription_status = 'active' AND subscription_end IS NULL;
