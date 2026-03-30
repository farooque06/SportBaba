-- Create table for subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'NRS',
    interval TEXT DEFAULT 'month', -- month, year
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read active plans
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
    FOR SELECT USING (true);

-- Only superadmins can insert/update/delete 
-- (Handled by service_role key or custom role checks via RPC if needed, 
-- but we rely on Next.js server actions using service_role for admin actions)
