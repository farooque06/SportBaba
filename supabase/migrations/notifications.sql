-- Notifications System Migration

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking_confirmed', 'booking_cancelled', 'booking_reminder', 'booking_updated', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    data JSONB DEFAULT '{}'::jsonb, -- Store additional context (booking details, etc.)
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_facility ON notifications(facility_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- 2. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    booking_confirmed BOOLEAN DEFAULT true,
    booking_cancelled BOOLEAN DEFAULT true,
    booking_reminder BOOLEAN DEFAULT true,
    booking_updated BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    in_app_notifications BOOLEAN DEFAULT true,
    reminder_minutes_before INTEGER DEFAULT 15, -- Minutes before booking to send reminder
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PUSH SUBSCRIPTION TABLE (for browser push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_used TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(profile_id, endpoint)
);

-- 4. NOTIFICATION QUEUE (for scheduled reminders)
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    INDEX idx_queue_scheduled ON notification_queue(scheduled_for),
    INDEX idx_queue_sent ON notification_queue(sent_at)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own notifications
CREATE POLICY "Users see their own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = recipient_id OR recipient_id IN (
    SELECT profile_id FROM memberships 
    WHERE facility_id = notifications.facility_id AND (role = 'owner' OR role = 'manager')
  ));

CREATE POLICY "Users manage their own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid()::text = profile_id);

CREATE POLICY "Users manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid()::text = profile_id);
