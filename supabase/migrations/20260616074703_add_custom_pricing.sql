-- Add custom_pricing column to resource_units table
-- This stores a JSONB array of dynamic pricing rules (e.g. peak hours, weekend pricing)
ALTER TABLE resource_units 
ADD COLUMN IF NOT EXISTS custom_pricing JSONB DEFAULT '[]'::jsonb;
