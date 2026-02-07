/*
  # Add Community Sections Features

  1. Changes to Existing Tables
    - Add `photos` column to `forum_topics` (text array for photo URLs)
    - Add `is_resolved` column to `forum_topics` (boolean for marking topics as resolved)

  2. New Tables
    - `castings_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `type` (text) - DJ, Danseur, Vidéo, Staff, Workshop, Figuration
      - `event_date` (date)
      - `fee` (text) - cachet/rémunération
      - `location` (text)
      - `contact_info` (text)
      - `photos` (text[])
      - `status` (text) - open, closed, filled
      - `views_count` (int)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users to create, read, update own content
    - Public read access for all listings
*/

-- Add columns to forum_topics if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_topics' AND column_name = 'photos'
  ) THEN
    ALTER TABLE forum_topics ADD COLUMN photos text[] DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'forum_topics' AND column_name = 'is_resolved'
  ) THEN
    ALTER TABLE forum_topics ADD COLUMN is_resolved boolean DEFAULT false;
  END IF;
END $$;

-- Add views_count to marketplace_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketplace_items' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE marketplace_items ADD COLUMN views_count int DEFAULT 0;
  END IF;
END $$;

-- Add contact_info to marketplace_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketplace_items' AND column_name = 'contact_info'
  ) THEN
    ALTER TABLE marketplace_items ADD COLUMN contact_info text DEFAULT '';
  END IF;
END $$;

-- Create Castings & Jobs Table
CREATE TABLE IF NOT EXISTS castings_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL DEFAULT 'Autre',
  event_date date,
  fee text DEFAULT '',
  location text NOT NULL,
  contact_info text DEFAULT '',
  photos text[] DEFAULT '{}',
  status text DEFAULT 'open',
  views_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE castings_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view castings"
  ON castings_jobs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create castings"
  ON castings_jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own castings"
  ON castings_jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own castings"
  ON castings_jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_castings_jobs_user_id ON castings_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_castings_jobs_type ON castings_jobs(type);
CREATE INDEX IF NOT EXISTS idx_castings_jobs_status ON castings_jobs(status);
CREATE INDEX IF NOT EXISTS idx_castings_jobs_event_date ON castings_jobs(event_date);