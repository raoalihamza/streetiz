/*
  # Create Music Schema for Streetiz

  1. New Tables
    - `music_tracks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `cover_url` (text)
      - `audio_url` (text)
      - `genre` (text) - House, Techno, Electro, etc.
      - `duration` (integer) - in seconds
      - `plays` (integer)
      - `likes` (integer)
      - `download_url` (text)
      - `buy_url` (text)
      - `soundcloud_url` (text)
      - `is_featured` (boolean)
      - `created_at` (timestamptz)
      
    - `music_dj_sets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `cover_url` (text)
      - `video_url` (text) - YouTube URL
      - `audio_url` (text) - Audio file URL
      - `description` (text)
      - `genre` (text)
      - `duration` (integer)
      - `plays` (integer)
      - `likes` (integer)
      - `is_live` (boolean)
      - `event_location` (text)
      - `created_at` (timestamptz)
      
    - `music_releases`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `cover_url` (text)
      - `audio_url` (text)
      - `description` (text)
      - `genre` (text)
      - `label` (text)
      - `release_date` (date)
      - `buy_url` (text)
      - `download_url` (text)
      - `is_exclusive` (boolean)
      - `created_at` (timestamptz)
      
    - `music_articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `cover_url` (text)
      - `artist` (text)
      - `genre` (text)
      - `audio_url` (text)
      - `video_url` (text)
      - `is_featured` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Create music_tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  cover_url text,
  audio_url text,
  genre text NOT NULL DEFAULT 'House',
  duration integer DEFAULT 0,
  plays integer DEFAULT 0,
  likes integer DEFAULT 0,
  download_url text,
  buy_url text,
  soundcloud_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view music tracks"
  ON music_tracks
  FOR SELECT
  TO public
  USING (true);

-- Create music_dj_sets table
CREATE TABLE IF NOT EXISTS music_dj_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  cover_url text,
  video_url text,
  audio_url text,
  description text,
  genre text NOT NULL DEFAULT 'House',
  duration integer DEFAULT 0,
  plays integer DEFAULT 0,
  likes integer DEFAULT 0,
  is_live boolean DEFAULT false,
  event_location text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE music_dj_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dj sets"
  ON music_dj_sets
  FOR SELECT
  TO public
  USING (true);

-- Create music_releases table
CREATE TABLE IF NOT EXISTS music_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  cover_url text,
  audio_url text,
  description text,
  genre text NOT NULL DEFAULT 'House',
  label text,
  release_date date DEFAULT CURRENT_DATE,
  buy_url text,
  download_url text,
  is_exclusive boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE music_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view music releases"
  ON music_releases
  FOR SELECT
  TO public
  USING (true);

-- Create music_articles table
CREATE TABLE IF NOT EXISTS music_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  cover_url text,
  artist text,
  genre text,
  audio_url text,
  video_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE music_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view music articles"
  ON music_articles
  FOR SELECT
  TO public
  USING (true);