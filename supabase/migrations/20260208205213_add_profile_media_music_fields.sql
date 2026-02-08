/*
  # Add Profile Media and Music Fields

  1. Purpose
    - Add music_url and music_type fields to profiles table
    - Create profile_photos table for 3x3 Instagram-style photo grid
    - Create profile_videos table for video carousel
    - Enable users to showcase their media content

  2. New Tables
    - `profile_photos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `url` (text, photo URL)
      - `order_index` (integer, for ordering photos)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `profile_videos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `url` (text, video URL)
      - `thumb_url` (text, thumbnail URL)
      - `order_index` (integer, for ordering videos)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Profile Fields
    - `music_url` (text, Spotify/Deezer/SoundCloud URL)
    - `music_type` (text, Track/Playlist/Album/Mix)

  4. Security
    - Enable RLS on both tables
    - Anyone can view photos/videos
    - Only owners can insert/update/delete their own photos/videos
    - Only owners can update their music fields
*/

-- Add music fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'music_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN music_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'music_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN music_type text DEFAULT 'Playlist';
  END IF;
END $$;

-- Create profile_photos table
CREATE TABLE IF NOT EXISTS profile_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_order_index CHECK (order_index >= 0 AND order_index < 9)
);

-- Create profile_videos table
CREATE TABLE IF NOT EXISTS profile_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url text NOT NULL,
  thumb_url text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_video_order CHECK (order_index >= 0 AND order_index < 6)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_id ON profile_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_order ON profile_photos(user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_profile_videos_user_id ON profile_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_videos_order ON profile_videos(user_id, order_index);

-- Enable RLS
ALTER TABLE profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_photos
CREATE POLICY "Anyone can view profile photos"
  ON profile_photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own photos"
  ON profile_photos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON profile_photos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON profile_photos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for profile_videos
CREATE POLICY "Anyone can view profile videos"
  ON profile_videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own videos"
  ON profile_videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON profile_videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON profile_videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);