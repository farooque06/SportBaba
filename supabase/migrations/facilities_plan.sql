-- Add plan_id to facilities to link to subscription_plans
ALTER TABLE facilities 
ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- Create an index to quickly lookup facilities by plan
CREATE INDEX IF NOT EXISTS idx_facilities_plan_id ON facilities(plan_id);
