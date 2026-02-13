-- ═══════════════════════════════════════════════════════════════
-- ROLLBACK Script for Voice Announcements Feature
-- ═══════════════════════════════════════════════════════════════
-- ⚠️  WARNING: This will DELETE all voice announcement data!
-- Run this ONLY if you want to completely undo the feature
-- ═══════════════════════════════════════════════════════════════

-- Step 1: Drop RLS policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can manage their own device tokens" ON device_tokens;
DROP POLICY IF EXISTS "Teachers can update delivery status" ON voice_announcement_deliveries;
DROP POLICY IF EXISTS "Teachers can view their voice announcements" ON voice_announcement_deliveries;
DROP POLICY IF EXISTS "Admins can view their school announcements" ON voice_announcements;
DROP POLICY IF EXISTS "Admins can create voice announcements" ON voice_announcements;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS idx_device_tokens_fcm;
DROP INDEX IF EXISTS idx_device_tokens_user;
DROP INDEX IF EXISTS idx_voice_announcement_deliveries_status;
DROP INDEX IF EXISTS idx_voice_announcement_deliveries_teacher;
DROP INDEX IF EXISTS idx_voice_announcement_deliveries_announcement;
DROP INDEX IF EXISTS idx_voice_announcements_created_by;
DROP INDEX IF EXISTS idx_voice_announcements_school;

-- Step 3: Drop tables (in reverse order due to foreign keys)
DROP TABLE IF EXISTS voice_announcement_deliveries CASCADE;
DROP TABLE IF EXISTS voice_announcements CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;

-- ═══════════════════════════════════════════════════════════════
-- ✅ ROLLBACK COMPLETE
-- All voice announcement tables, indexes, and policies removed.
-- ═══════════════════════════════════════════════════════════════
