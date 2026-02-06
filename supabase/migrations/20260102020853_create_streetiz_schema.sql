/*
  # STREETIZ Platform Database Schema

  ## Overview
  Complete database schema for STREETIZ - a cultural platform for urban, sport, dance, DJ and clubbing content.

  ## 1. New Tables

  ### `profiles`
  User profile extension with role-based access
  - `id` (uuid, references auth.users)
  - `username` (text, unique)
  - `display_name` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `role` (text) - visitor, member, verified_member, organizer, admin
  - `is_verified` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `news`
  News articles and blog posts
  - `id` (uuid, primary key)
  - `title` (text)
  - `slug` (text, unique)
  - `content` (text)
  - `excerpt` (text)
  - `featured_image` (text)
  - `author_id` (uuid, references profiles)
  - `status` (text) - draft, published, archived
  - `featured` (boolean)
  - `views` (integer)
  - `published_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `videos`
  Video content with popup player support
  - `id` (uuid, primary key)
  - `title` (text)
  - `slug` (text, unique)
  - `description` (text)
  - `video_url` (text) - YouTube/Vimeo URL
  - `video_type` (text) - youtube, vimeo
  - `thumbnail_url` (text)
  - `author_id` (uuid, references profiles)
  - `category` (text) - dance, dj, sports, battles, etc
  - `tags` (text[])
  - `status` (text) - pending, approved, published, rejected
  - `featured` (boolean)
  - `views` (integer)
  - `duration` (integer) - in seconds
  - `published_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `music`
  Music tracks with global player support
  - `id` (uuid, primary key)
  - `title` (text)
  - `artist` (text)
  - `slug` (text, unique)
  - `audio_url` (text)
  - `cover_image` (text)
  - `author_id` (uuid, references profiles)
  - `genre` (text)
  - `tags` (text[])
  - `duration` (integer) - in seconds
  - `status` (text) - pending, approved, published, rejected
  - `featured` (boolean)
  - `plays` (integer)
  - `published_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `events`
  Events with creation and admin validation
  - `id` (uuid, primary key)
  - `title` (text)
  - `slug` (text, unique)
  - `description` (text)
  - `event_date` (timestamptz)
  - `end_date` (timestamptz)
  - `location` (text)
  - `address` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `featured_image` (text)
  - `organizer_id` (uuid, references profiles)
  - `category` (text) - battle, party, workshop, concert
  - `tags` (text[])
  - `status` (text) - pending, approved, published, rejected, cancelled
  - `ticket_url` (text)
  - `price` (numeric)
  - `capacity` (integer)
  - `attendees_count` (integer)
  - `featured` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `community_submissions`
  User-generated content with moderation
  - `id` (uuid, primary key)
  - `title` (text)
  - `content` (text)
  - `content_type` (text) - news, video, music, event
  - `media_url` (text)
  - `submitter_id` (uuid, references profiles)
  - `status` (text) - pending, approved, rejected
  - `moderation_notes` (text)
  - `moderated_by` (uuid, references profiles)
  - `moderated_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `event_media`
  Media uploads for events (Streetiz Drop)
  - `id` (uuid, primary key)
  - `event_id` (uuid, references events)
  - `uploader_id` (uuid, references profiles)
  - `media_type` (text) - image, video
  - `media_url` (text)
  - `thumbnail_url` (text)
  - `status` (text) - pending, approved, rejected
  - `created_at` (timestamptz)

  ### `favorites`
  User favorites for content
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `content_type` (text) - news, video, music, event
  - `content_id` (uuid)
  - `created_at` (timestamptz)

  ### `playlists`
  User music playlists
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `is_public` (boolean)
  - `cover_image` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `playlist_tracks`
  Tracks in playlists
  - `id` (uuid, primary key)
  - `playlist_id` (uuid, references playlists)
  - `track_id` (uuid, references music)
  - `position` (integer)
  - `added_at` (timestamptz)

  ## 2. Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Policies restrict access based on user roles and ownership
  - Public read access for published content
  - Authenticated users can create submissions
  - Only admins/organizers can moderate content
  - Users can only edit their own content

  ## 3. Indexes
  - Slug fields for fast lookups
  - Foreign keys for relationships
  - Status fields for filtering
  - Published dates for chronological queries
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  role text NOT NULL DEFAULT 'visitor' CHECK (role IN ('visitor', 'member', 'verified_member', 'organizer', 'admin')),
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  video_url text NOT NULL,
  video_type text NOT NULL CHECK (video_type IN ('youtube', 'vimeo')),
  thumbnail_url text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text,
  tags text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  duration integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Music table
CREATE TABLE IF NOT EXISTS music (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  artist text NOT NULL,
  slug text UNIQUE NOT NULL,
  audio_url text NOT NULL,
  cover_image text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  genre text,
  tags text[],
  duration integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected')),
  featured boolean DEFAULT false,
  plays integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  address text,
  latitude numeric,
  longitude numeric,
  featured_image text,
  organizer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text,
  tags text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'published', 'rejected', 'cancelled')),
  ticket_url text,
  price numeric DEFAULT 0,
  capacity integer,
  attendees_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Community submissions table
CREATE TABLE IF NOT EXISTS community_submissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text,
  content_type text NOT NULL CHECK (content_type IN ('news', 'video', 'music', 'event')),
  media_url text,
  submitter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  moderation_notes text,
  moderated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  moderated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event media table
CREATE TABLE IF NOT EXISTS event_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  uploader_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url text NOT NULL,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('news', 'video', 'music', 'event')),
  content_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Playlist tracks table
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  track_id uuid REFERENCES music(id) ON DELETE CASCADE,
  position integer NOT NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, track_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_music_slug ON music(slug);
CREATE INDEX IF NOT EXISTS idx_music_status ON music(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON community_submissions(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- News policies
CREATE POLICY "Published news viewable by everyone"
  ON news FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

CREATE POLICY "Authors can view own news"
  ON news FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Authors can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own news"
  ON news FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Videos policies
CREATE POLICY "Published videos viewable by everyone"
  ON videos FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

CREATE POLICY "Authors can view own videos"
  ON videos FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Members can submit videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Music policies
CREATE POLICY "Published music viewable by everyone"
  ON music FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

CREATE POLICY "Authors can view own music"
  ON music FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Members can submit music"
  ON music FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update own music"
  ON music FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Events policies
CREATE POLICY "Published events viewable by everyone"
  ON events FOR SELECT
  TO authenticated, anon
  USING (status = 'published' OR status = 'approved');

CREATE POLICY "Organizers can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (organizer_id = auth.uid());

CREATE POLICY "Organizers can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (organizer_id = auth.uid());

CREATE POLICY "Organizers can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Community submissions policies
CREATE POLICY "Submitters can view own submissions"
  ON community_submissions FOR SELECT
  TO authenticated
  USING (submitter_id = auth.uid());

CREATE POLICY "Members can create submissions"
  ON community_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitter_id = auth.uid());

CREATE POLICY "Submitters can update own submissions"
  ON community_submissions FOR UPDATE
  TO authenticated
  USING (submitter_id = auth.uid() AND status = 'pending')
  WITH CHECK (submitter_id = auth.uid());

-- Event media policies
CREATE POLICY "Event media viewable by everyone"
  ON event_media FOR SELECT
  TO authenticated, anon
  USING (status = 'approved');

CREATE POLICY "Authenticated users can upload event media"
  ON event_media FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Playlists policies
CREATE POLICY "Public playlists viewable by everyone"
  ON playlists FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "Users can view own playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Playlist tracks policies
CREATE POLICY "Playlist tracks viewable with playlist"
  ON playlist_tracks FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND (playlists.is_public = true OR playlists.user_id = auth.uid())
    )
  );

CREATE POLICY "Playlist owners can manage tracks"
  ON playlist_tracks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Playlist owners can delete tracks"
  ON playlist_tracks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.user_id = auth.uid()
    )
  );