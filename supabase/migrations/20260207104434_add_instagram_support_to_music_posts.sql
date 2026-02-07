/*
  # Add Instagram Support to Music Video Posts

  ## Overview
  Adds Instagram support to the music_video_posts table to allow vertical video posts from Instagram.

  ## Changes Made
  
  ### Table Updates
  - Update `content_type` check constraint to include 'instagram'
  - Add `instagram_url` column for Instagram post URLs
  - Add `instagram_embed_code` column for Instagram embed codes

  ## Notes
  - Existing data is preserved
  - The content_type field now accepts 'youtube', 'soundcloud', or 'instagram'
*/

-- Drop existing check constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'music_video_posts_content_type_check'
    AND table_name = 'music_video_posts'
  ) THEN
    ALTER TABLE music_video_posts DROP CONSTRAINT music_video_posts_content_type_check;
  END IF;
END $$;

-- Add new check constraint with instagram support
ALTER TABLE music_video_posts 
ADD CONSTRAINT music_video_posts_content_type_check 
CHECK (content_type IN ('youtube', 'soundcloud', 'instagram'));

-- Add instagram columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_video_posts' AND column_name = 'instagram_url'
  ) THEN
    ALTER TABLE music_video_posts ADD COLUMN instagram_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_video_posts' AND column_name = 'instagram_embed_code'
  ) THEN
    ALTER TABLE music_video_posts ADD COLUMN instagram_embed_code text;
  END IF;
END $$;