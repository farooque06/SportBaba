-- Table for Global Platform Settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1,
  maintenance_mode BOOLEAN DEFAULT false,
  support_email TEXT DEFAULT 'far00queapril17@gmail.com',
  default_currency TEXT DEFAULT 'NRS',
  nexi_live_mode BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO platform_settings (id, maintenance_mode, support_email)
VALUES (1, false, 'far00queapril17@gmail.com')
ON CONFLICT (id) DO NOTHING;
