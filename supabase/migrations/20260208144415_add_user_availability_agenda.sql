/*
  # Add User Availability & Agenda System

  1. Changes to profiles table
    - Add `free_tonight` (boolean) - Indicates if user is available to go out tonight
    - Add `out_now` (boolean) - Indicates if user is currently out at a party/event
    - Add `out_location` (text) - Optional location when user is out
    - Add `out_since` (timestamptz) - When user started being out (for auto-disable)
    
  2. New Tables
    - `user_agenda_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `event_date` (date)
      - `location` (text)
      - `event_type` (text) - party, battle, workshop, concert, etc.
      - `description` (text)
      - `is_public` (boolean) - Whether to show on profile
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS on user_agenda_events
    - Users can read public events from any user
    - Users can only create/update/delete their own events
*/

-- Add availability fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'free_tonight'
  ) THEN
    ALTER TABLE profiles ADD COLUMN free_tonight boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'out_now'
  ) THEN
    ALTER TABLE profiles ADD COLUMN out_now boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'out_location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN out_location text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'out_since'
  ) THEN
    ALTER TABLE profiles ADD COLUMN out_since timestamptz;
  END IF;
END $$;

-- Create user agenda events table
CREATE TABLE IF NOT EXISTS user_agenda_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  event_date date NOT NULL,
  location text DEFAULT '',
  event_type text DEFAULT 'other',
  description text DEFAULT '',
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_agenda_events ENABLE ROW LEVEL SECURITY;

-- Policies for user_agenda_events
CREATE POLICY "Users can view public agenda events"
  ON user_agenda_events FOR SELECT
  TO public
  USING (is_public = true);

CREATE POLICY "Users can view own agenda events"
  ON user_agenda_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own agenda events"
  ON user_agenda_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agenda events"
  ON user_agenda_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own agenda events"
  ON user_agenda_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_agenda_events_user_id ON user_agenda_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_agenda_events_date ON user_agenda_events(event_date);
CREATE INDEX IF NOT EXISTS idx_user_agenda_events_public ON user_agenda_events(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_free_tonight ON profiles(free_tonight) WHERE free_tonight = true;
CREATE INDEX IF NOT EXISTS idx_profiles_out_now ON profiles(out_now) WHERE out_now = true;