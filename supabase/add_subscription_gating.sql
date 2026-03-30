-- Add Subscription Tracking to Facilities
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid')),
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ DEFAULT (now() + interval '30 days');

-- Update existing facilities to trialing if they don't have a status
UPDATE facilities SET subscription_status = 'trialing' WHERE subscription_status IS NULL;
