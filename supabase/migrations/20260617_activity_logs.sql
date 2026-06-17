-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    facility_id TEXT REFERENCES facilities(id) ON DELETE CASCADE,
    actor_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for querying logs by facility and time
CREATE INDEX IF NOT EXISTS idx_activity_logs_facility_time ON activity_logs(facility_id, created_at DESC);
-- Index for querying superadmin logs (facility_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_activity_logs_global_time ON activity_logs(created_at DESC) WHERE facility_id IS NULL;
-- Index for querying logs by actor
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor ON activity_logs(actor_id);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Superadmins can view all logs
CREATE POLICY "Superadmins can view all logs" ON activity_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()::text 
            AND profiles.role = 'superadmin'
        )
    );

-- Facility owners and managers can view logs for their facility
CREATE POLICY "Facility admins can view their facility logs" ON activity_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.profile_id = auth.uid()::text
            AND memberships.facility_id = activity_logs.facility_id
            AND memberships.role IN ('owner', 'manager')
        )
    );

-- Anyone authenticated can insert logs (so staff can log actions without needing select access)
CREATE POLICY "Authenticated users can insert logs" ON activity_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Function to cleanup old logs
CREATE OR REPLACE FUNCTION cleanup_old_activity_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule the cleanup to run daily (requires pg_cron extension, assuming it's enabled on Supabase)
-- In Supabase dashboard, you would typically run this in the SQL Editor:
-- SELECT cron.schedule('cleanup_activity_logs_daily', '0 0 * * *', 'SELECT cleanup_old_activity_logs();');
