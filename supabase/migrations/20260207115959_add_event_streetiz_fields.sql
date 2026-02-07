/*
  # Add Streetiz-specific fields to events table

  1. New Columns
    - `music_genre` (text) - Music genre for club/music events (Techno, House, etc.)
    - `battle_level` (text) - Battle difficulty level (beginner, intermediate, pro)
    - `vibes` (text[]) - Event vibes/atmosphere tags (Underground, Rave, Chic, etc.)
    - `is_fashion_week` (boolean) - Flag for Paris Fashion Week events
    - `is_free` (boolean) - Flag for free entry events

  2. Changes
    - Adds fields to better categorize and filter Streetiz events
    - Supports music genres, battle levels, and vibes for enhanced filtering
*/

-- Add new columns to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'music_genre'
  ) THEN
    ALTER TABLE events ADD COLUMN music_genre text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'battle_level'
  ) THEN
    ALTER TABLE events ADD COLUMN battle_level text CHECK (battle_level IN ('beginner', 'intermediate', 'pro'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'vibes'
  ) THEN
    ALTER TABLE events ADD COLUMN vibes text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_fashion_week'
  ) THEN
    ALTER TABLE events ADD COLUMN is_fashion_week boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_free'
  ) THEN
    ALTER TABLE events ADD COLUMN is_free boolean DEFAULT false;
  END IF;
END $$;

-- Update existing free events
UPDATE events SET is_free = true WHERE price = 0;