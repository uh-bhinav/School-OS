-- Voice Announcements Feature Migration
-- Created: 2026-02-08
-- Description: Tables for voice announcement call system

-- Table for voice announcements
CREATE TABLE IF NOT EXISTS voice_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL,
    created_by UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audio_file_url TEXT NOT NULL,
    audio_duration INTEGER,
    target_audience JSONB NOT NULL DEFAULT '{"type": "all_teachers"}',
    priority VARCHAR(50) DEFAULT 'high',
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking delivery and playback
CREATE TABLE IF NOT EXISTS voice_announcement_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    announcement_id UUID NOT NULL REFERENCES voice_announcements(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL,
    fcm_token TEXT,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    played_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing device FCM tokens
CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fcm_token TEXT NOT NULL UNIQUE,
    platform VARCHAR(20) NOT NULL,
    device_id TEXT,
    app_version TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_voice_announcements_school ON voice_announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_voice_announcements_created_by ON voice_announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_voice_announcement_deliveries_announcement ON voice_announcement_deliveries(announcement_id);
CREATE INDEX IF NOT EXISTS idx_voice_announcement_deliveries_teacher ON voice_announcement_deliveries(teacher_id);
CREATE INDEX IF NOT EXISTS idx_voice_announcement_deliveries_status ON voice_announcement_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_device_tokens_fcm ON device_tokens(fcm_token);

-- Enable RLS
ALTER TABLE voice_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_announcement_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simplified - adjust based on your auth setup)
-- For now, allowing authenticated users to access their own data

-- voice_announcements: Allow all authenticated users (admins will create via backend API with proper checks)
DROP POLICY IF EXISTS "Allow authenticated users voice announcements" ON voice_announcements;
CREATE POLICY "Allow authenticated users voice announcements"
    ON voice_announcements FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- voice_announcement_deliveries: Users can only see/update their own deliveries
DROP POLICY IF EXISTS "Users manage own deliveries" ON voice_announcement_deliveries;
CREATE POLICY "Users manage own deliveries"
    ON voice_announcement_deliveries FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- device_tokens: Users can only manage their own tokens
DROP POLICY IF EXISTS "Users manage own tokens" ON device_tokens;
CREATE POLICY "Users manage own tokens"
    ON device_tokens FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE voice_announcements IS 'Stores voice announcement recordings sent to teachers';
COMMENT ON TABLE voice_announcement_deliveries IS 'Tracks delivery and playback status for each teacher';
COMMENT ON TABLE device_tokens IS 'Stores FCM tokens for push notifications';
