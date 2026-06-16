-- Create platform_payments table to track all subscription payments (including partial)
CREATE TABLE IF NOT EXISTS platform_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id TEXT NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_due NUMERIC(10, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED,
  currency TEXT NOT NULL DEFAULT 'NRS',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by facility
CREATE INDEX IF NOT EXISTS idx_platform_payments_facility ON platform_payments(facility_id);
-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_platform_payments_status ON platform_payments(status);
