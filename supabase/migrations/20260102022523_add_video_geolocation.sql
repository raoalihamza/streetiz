/*
  # Add Geolocation to Videos

  ## Changes
  
  1. Videos Table Updates
    - Add `event_id` (uuid, references events) - Link videos to events
    - Add `city` (text) - City where video was recorded
    - Add `country` (text) - Country where video was recorded
    - Add `latitude` (numeric) - Latitude coordinate
    - Add `longitude` (numeric) - Longitude coordinate
    - Add `year` (integer) - Year video was recorded
    - Add `video_subtype` (text) - DJ set, Battle, Aftermovie, etc

  2. Indexes
    - Add index on event_id for faster lookups
    - Add index on country and city for filtering
    - Add index on year for temporal filtering

  ## Notes
  - Geolocation data enables world map video discovery
  - Event linking provides context for each video
*/

-- Add geolocation and event linking to videos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'event_id'
  ) THEN
    ALTER TABLE videos ADD COLUMN event_id uuid REFERENCES events(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'city'
  ) THEN
    ALTER TABLE videos ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'country'
  ) THEN
    ALTER TABLE videos ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE videos ADD COLUMN latitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE videos ADD COLUMN longitude numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'year'
  ) THEN
    ALTER TABLE videos ADD COLUMN year integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'videos' AND column_name = 'video_subtype'
  ) THEN
    ALTER TABLE videos ADD COLUMN video_subtype text;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_videos_event_id ON videos(event_id);
CREATE INDEX IF NOT EXISTS idx_videos_country ON videos(country);
CREATE INDEX IF NOT EXISTS idx_videos_city ON videos(city);
CREATE INDEX IF NOT EXISTS idx_videos_year ON videos(year);
CREATE INDEX IF NOT EXISTS idx_videos_location ON videos(latitude, longitude);