/*
  # Add Download and Purchase Links to Music Posts

  1. Changes
    - Add `download_url` column (text, nullable) - for free download links
    - Add `purchase_url` column (text, nullable) - for purchase links (Beatport, Bandcamp, etc.)
    - Add `purchase_platform` column (text, nullable) - to identify the platform ('beatport', 'bandcamp', 'other')

  2. Purpose
    - Allow tracks to have free download links
    - Allow tracks to have purchase links with platform identification
    - Display appropriate icons and labels based on availability
*/

-- Add download and purchase fields to music_video_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_video_posts' AND column_name = 'download_url'
  ) THEN
    ALTER TABLE music_video_posts ADD COLUMN download_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_video_posts' AND column_name = 'purchase_url'
  ) THEN
    ALTER TABLE music_video_posts ADD COLUMN purchase_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_video_posts' AND column_name = 'purchase_platform'
  ) THEN
    ALTER TABLE music_video_posts ADD COLUMN purchase_platform text;
  END IF;
END $$;
