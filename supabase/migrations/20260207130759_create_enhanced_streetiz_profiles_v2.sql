/*
  # Enhanced Streetiz Profile System v2

  1. New Tables
    - `profile_media` - Photo and video galleries
    - `profile_social_links` - Social media links

  2. Updates to Existing Tables
    - Add new columns to `profile_extensions` for roles, styles, bio, etc.

  3. Security
    - Enable RLS with proper policies
    - Photo limit: 9 per user
    - Video limit: 3 per user
*/

-- Add new columns to profile_extensions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'cover_url') THEN
    ALTER TABLE profile_extensions ADD COLUMN cover_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'country') THEN
    ALTER TABLE profile_extensions ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'roles') THEN
    ALTER TABLE profile_extensions ADD COLUMN roles text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'music_styles') THEN
    ALTER TABLE profile_extensions ADD COLUMN music_styles text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'dance_styles') THEN
    ALTER TABLE profile_extensions ADD COLUMN dance_styles text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'vibes') THEN
    ALTER TABLE profile_extensions ADD COLUMN vibes text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'bio_text') THEN
    ALTER TABLE profile_extensions ADD COLUMN bio_text text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'crew_or_collective') THEN
    ALTER TABLE profile_extensions ADD COLUMN crew_or_collective text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'skill_level') THEN
    ALTER TABLE profile_extensions ADD COLUMN skill_level text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'events_count') THEN
    ALTER TABLE profile_extensions ADD COLUMN events_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'workshops_count') THEN
    ALTER TABLE profile_extensions ADD COLUMN workshops_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profile_extensions' AND column_name = 'mixes_count') THEN
    ALTER TABLE profile_extensions ADD COLUMN mixes_count integer DEFAULT 0;
  END IF;
END $$;

-- Create profile_media table
CREATE TABLE IF NOT EXISTS profile_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  media_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_media_user_id ON profile_media(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_media_type ON profile_media(user_id, media_type);

ALTER TABLE profile_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view profile media" ON profile_media;
DROP POLICY IF EXISTS "Users can insert their own media" ON profile_media;
DROP POLICY IF EXISTS "Users can update their own media" ON profile_media;
DROP POLICY IF EXISTS "Users can delete their own media" ON profile_media;

CREATE POLICY "Anyone can view profile media"
  ON profile_media FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own media"
  ON profile_media FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
  ON profile_media FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
  ON profile_media FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create profile_social_links table
CREATE TABLE IF NOT EXISTS profile_social_links (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  instagram_url text,
  tiktok_url text,
  youtube_url text,
  soundcloud_url text,
  spotify_url text,
  other_url text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profile_social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view social links" ON profile_social_links;
DROP POLICY IF EXISTS "Users can insert their own social links" ON profile_social_links;
DROP POLICY IF EXISTS "Users can update their own social links" ON profile_social_links;
DROP POLICY IF EXISTS "Users can delete their own social links" ON profile_social_links;

CREATE POLICY "Anyone can view social links"
  ON profile_social_links FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own social links"
  ON profile_social_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social links"
  ON profile_social_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social links"
  ON profile_social_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to enforce photo limit (max 9)
CREATE OR REPLACE FUNCTION check_photo_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.media_type = 'photo' THEN
    IF (SELECT COUNT(*) FROM profile_media WHERE user_id = NEW.user_id AND media_type = 'photo') >= 9 THEN
      RAISE EXCEPTION 'Maximum of 9 photos allowed per profile';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to enforce video limit (max 3)
CREATE OR REPLACE FUNCTION check_video_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.media_type = 'video' THEN
    IF (SELECT COUNT(*) FROM profile_media WHERE user_id = NEW.user_id AND media_type = 'video') >= 3 THEN
      RAISE EXCEPTION 'Maximum of 3 videos allowed per profile';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_photo_limit ON profile_media;
CREATE TRIGGER enforce_photo_limit
  BEFORE INSERT ON profile_media
  FOR EACH ROW
  WHEN (NEW.media_type = 'photo')
  EXECUTE FUNCTION check_photo_limit();

DROP TRIGGER IF EXISTS enforce_video_limit ON profile_media;
CREATE TRIGGER enforce_video_limit
  BEFORE INSERT ON profile_media
  FOR EACH ROW
  WHEN (NEW.media_type = 'video')
  EXECUTE FUNCTION check_video_limit();
