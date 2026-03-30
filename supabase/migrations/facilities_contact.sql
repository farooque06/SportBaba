-- Add contact fields to the facilities table for CRM capabilities
ALTER TABLE facilities
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;
