/*
  # Enhanced Music Schema for Spotify-style Layout

  ## New Tables
  
  1. **music_playlists**
    - `id` (uuid, primary key)
    - `title` (text) - Playlist name
    - `description` (text) - Playlist description
    - `cover_url` (text) - Playlist cover image
    - `curator` (text) - Who curated it
    - `track_count` (integer) - Number of tracks
    - `is_featured` (boolean) - Featured on homepage
    - `playlist_type` (text) - discover_weekly, editorial, user, etc.
    - `tags` (text[]) - Genre tags
    - `created_at` (timestamptz)

  2. **music_playlist_tracks**
    - `id` (uuid, primary key)
    - `playlist_id` (uuid, foreign key)
    - `track_id` (uuid, foreign key)
    - `position` (integer) - Order in playlist
    - `added_at` (timestamptz)

  3. **music_spotlights**
    - `id` (uuid, primary key)
    - `title` (text) - Spotlight title
    - `subtitle` (text) - Artist or description
    - `cover_url` (text) - Large hero image
    - `content_type` (text) - playlist, track, remix, dj_set, article
    - `content_id` (uuid) - Link to actual content
    - `tags` (text[]) - Remix, Playlist, DJ Set, Free DL
    - `external_url` (text) - External platform link
    - `is_active` (boolean) - Currently displayed
    - `priority` (integer) - Display order
    - `start_date` (timestamptz)
    - `end_date` (timestamptz)
    - `created_at` (timestamptz)

  4. **music_platform_releases**
    - `id` (uuid, primary key)
    - `title` (text)
    - `artist` (text)
    - `cover_url` (text)
    - `platform` (text) - spotify, deezer, soundcloud, beatport, youtube
    - `platform_id` (text) - ID on that platform
    - `external_url` (text)
    - `release_type` (text) - new, remix, album, ep, single
    - `genres` (text[])
    - `is_new` (boolean)
    - `release_date` (timestamptz)
    - `created_at` (timestamptz)

  5. **music_charts**
    - `id` (uuid, primary key)
    - `chart_type` (text) - streetiz_weekly, beatport_top_10
    - `track_id` (uuid, foreign key)
    - `position` (integer)
    - `previous_position` (integer)
    - `week_start` (date)
    - `created_at` (timestamptz)

  6. **music_podcasts**
    - `id` (uuid, primary key)
    - `title` (text)
    - `host` (text)
    - `cover_url` (text)
    - `audio_url` (text)
    - `description` (text)
    - `duration` (integer)
    - `episode_number` (integer)
    - `published_at` (timestamptz)
    - `created_at` (timestamptz)

  ## Table Modifications
  
  - Add `platform` field to music_tracks (spotify, deezer, soundcloud, etc.)
  - Add `is_remix` boolean to music_tracks
  - Add `is_free_download` boolean to music_tracks
  - Add `bpm` integer to music_tracks
  - Add `mood_tags` text[] to music_tracks
  - Add `external_platform_url` to music_tracks

  ## Security
  
  - Enable RLS on all new tables
  - Add policies for public read access
  - Add policies for authenticated insert/update
*/

-- Create music_playlists table
CREATE TABLE IF NOT EXISTS music_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text NOT NULL,
  curator text DEFAULT 'Streetiz',
  track_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  playlist_type text DEFAULT 'editorial',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create music_playlist_tracks junction table
CREATE TABLE IF NOT EXISTS music_playlist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES music_playlists(id) ON DELETE CASCADE,
  track_id uuid REFERENCES music_tracks(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- Create music_spotlights table
CREATE TABLE IF NOT EXISTS music_spotlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  cover_url text NOT NULL,
  content_type text NOT NULL,
  content_id uuid,
  tags text[] DEFAULT '{}',
  external_url text,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create music_platform_releases table
CREATE TABLE IF NOT EXISTS music_platform_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  cover_url text NOT NULL,
  platform text NOT NULL,
  platform_id text,
  external_url text NOT NULL,
  release_type text DEFAULT 'new',
  genres text[] DEFAULT '{}',
  is_new boolean DEFAULT true,
  release_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create music_charts table
CREATE TABLE IF NOT EXISTS music_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_type text NOT NULL,
  track_id uuid REFERENCES music_tracks(id) ON DELETE CASCADE,
  position integer NOT NULL,
  previous_position integer,
  week_start date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Create music_podcasts table
CREATE TABLE IF NOT EXISTS music_podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  host text NOT NULL,
  cover_url text NOT NULL,
  audio_url text NOT NULL,
  description text,
  duration integer DEFAULT 0,
  episode_number integer,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing music_tracks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_tracks' AND column_name = 'platform'
  ) THEN
    ALTER TABLE music_tracks ADD COLUMN platform text DEFAULT 'streetiz';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_tracks' AND column_name = 'is_remix'
  ) THEN
    ALTER TABLE music_tracks ADD COLUMN is_remix boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_tracks' AND column_name = 'is_free_download'
  ) THEN
    ALTER TABLE music_tracks ADD COLUMN is_free_download boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_tracks' AND column_name = 'bpm'
  ) THEN
    ALTER TABLE music_tracks ADD COLUMN bpm integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_tracks' AND column_name = 'mood_tags'
  ) THEN
    ALTER TABLE music_tracks ADD COLUMN mood_tags text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'music_tracks' AND column_name = 'external_platform_url'
  ) THEN
    ALTER TABLE music_tracks ADD COLUMN external_platform_url text;
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE music_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_spotlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_platform_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_podcasts ENABLE ROW LEVEL SECURITY;

-- Create policies for music_playlists
CREATE POLICY "Anyone can view playlists"
  ON music_playlists FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create playlists"
  ON music_playlists FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for music_playlist_tracks
CREATE POLICY "Anyone can view playlist tracks"
  ON music_playlist_tracks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can add tracks to playlists"
  ON music_playlist_tracks FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for music_spotlights
CREATE POLICY "Anyone can view active spotlights"
  ON music_spotlights FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated users can manage spotlights"
  ON music_spotlights FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for music_platform_releases
CREATE POLICY "Anyone can view platform releases"
  ON music_platform_releases FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can add platform releases"
  ON music_platform_releases FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policies for music_charts
CREATE POLICY "Anyone can view charts"
  ON music_charts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage charts"
  ON music_charts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for music_podcasts
CREATE POLICY "Anyone can view podcasts"
  ON music_podcasts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create podcasts"
  ON music_podcasts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_music_playlists_featured ON music_playlists(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_music_playlists_type ON music_playlists(playlist_type);
CREATE INDEX IF NOT EXISTS idx_music_spotlights_active ON music_spotlights(is_active, priority) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_music_platform_releases_date ON music_platform_releases(release_date DESC);
CREATE INDEX IF NOT EXISTS idx_music_platform_releases_platform ON music_platform_releases(platform);
CREATE INDEX IF NOT EXISTS idx_music_charts_type_week ON music_charts(chart_type, week_start);
CREATE INDEX IF NOT EXISTS idx_music_tracks_remix ON music_tracks(is_remix) WHERE is_remix = true;
CREATE INDEX IF NOT EXISTS idx_music_tracks_free_dl ON music_tracks(is_free_download) WHERE is_free_download = true;
