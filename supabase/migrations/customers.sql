-- SportBaba: Customer Profiles Migration
-- Run this in your Supabase SQL Editor

-- 1. Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  total_visits INT DEFAULT 0,
  total_spent DECIMAL DEFAULT 0,
  last_visit TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_facility ON customers(facility_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(facility_id, phone);

-- 3. Add customer_id to bookings (nullable FK)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- 4. RLS Policies (optional but recommended)
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Facility can manage own customers" ON customers
--   FOR ALL USING (facility_id = current_setting('app.facility_id', true));
