-- Migration script to add missing columns to tables
-- Run this script on your database to fix the errors

BEGIN;

-- Add missing columns to the landslides table
ALTER TABLE landslides
ADD COLUMN IF NOT EXISTS first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns to the monitoring_areas table
ALTER TABLE monitoring_areas
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix notification_settings table
ALTER TABLE notification_settings
ADD COLUMN IF NOT EXISTS monthly_reports BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS weekly_reports BOOLEAN DEFAULT TRUE;

-- Rename monthly_report to monthly_reports if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'notification_settings' AND column_name = 'monthly_report'
  ) THEN
    ALTER TABLE notification_settings RENAME COLUMN monthly_report TO monthly_reports;
  END IF;
END $$;

-- Add missing columns to the alerts table
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS inspection_event_id INTEGER,
ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20);

-- Add missing columns used in search keywords
DO $$
BEGIN
  -- Handle landslide_count - might be in monitoring_areas or in a separate table
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'monitoring_areas' AND column_name = 'landslide_count'
  ) THEN
    ALTER TABLE monitoring_areas ADD COLUMN landslide_count INTEGER DEFAULT 0;
  END IF;
END $$;

COMMIT;

-- Optional: Update monitoring_areas.landslide_count based on actual landslide counts
-- Uncomment and run if needed
/*
UPDATE monitoring_areas ma
SET landslide_count = (
  SELECT COUNT(*) 
  FROM landslides l 
  WHERE l.monitoring_area_id = ma.id
);
*/