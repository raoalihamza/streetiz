/*
  # Create Music Video Posts

  ## Overview
  Creates a table for music video posts displayed in the Explore Feed on the Music page.
  These posts feature YouTube videos and SoundCloud embeds instead of regular tracks.

  ## Tables Created
  
  ### `music_video_posts`
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Post title
  - `artist` (text) - Artist or creator name
  - `cover_url` (text) - Thumbnail/cover image URL
  - `content_type` (text) - Type of content: 'youtube' or 'soundcloud'
  - `youtube_url` (text, nullable) - YouTube video URL
  - `youtube_embed_id` (text, nullable) - YouTube video ID for embedding
  - `soundcloud_url` (text, nullable) - SoundCloud track URL
  - `soundcloud_embed_code` (text, nullable) - SoundCloud embed HTML code
  - `description` (text, nullable) - Post description
  - `genre` (text) - Music genre
  - `tags` (text[]) - Array of tags
  - `likes` (integer) - Number of likes
  - `plays` (integer) - Number of plays/views
  - `is_featured` (boolean) - Whether post is featured
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on the table
  - Allow public read access for all users
  - Only authenticated organizers can insert/update/delete
*/

-- Create music_video_posts table
CREATE TABLE IF NOT EXISTS music_video_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  cover_url text,
  content_type text NOT NULL CHECK (content_type IN ('youtube', 'soundcloud')),
  youtube_url text,
  youtube_embed_id text,
  soundcloud_url text,
  soundcloud_embed_code text,
  description text,
  genre text DEFAULT 'Electronic',
  tags text[] DEFAULT '{}',
  likes integer DEFAULT 0,
  plays integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE music_video_posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read posts
CREATE POLICY "Anyone can view music video posts"
  ON music_video_posts
  FOR SELECT
  USING (true);

-- Only authenticated organizers can insert posts
CREATE POLICY "Organizers can insert music video posts"
  ON music_video_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('organizer', 'admin')
    )
  );

-- Only authenticated organizers can update posts
CREATE POLICY "Organizers can update music video posts"
  ON music_video_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('organizer', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('organizer', 'admin')
    )
  );

-- Only authenticated organizers can delete posts
CREATE POLICY "Organizers can delete music video posts"
  ON music_video_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('organizer', 'admin')
    )
  );