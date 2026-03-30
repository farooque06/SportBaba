-- Add Base Price to Resource Units
ALTER TABLE resource_units 
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00;

-- Optional: Initial prices for existing data
UPDATE resource_units SET base_price = 50.00 WHERE unit_type = 'pitch' AND base_price = 0;
UPDATE resource_units SET base_price = 20.00 WHERE unit_type = 'net' AND base_price = 0;
