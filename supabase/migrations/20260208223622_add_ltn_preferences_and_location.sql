/*
  # Add LTN (Libre Tonight) Preferences and Location

  1. New Fields
    - `ltn_preferences` (jsonb)
      - Stores multi-select preferences for outing types
      - Options: bar_dansant, soiree_techno, soiree_privee_after, training_danse, decouverte_spot
    
    - `ltn_location` (jsonb)
      - Stores location details for LTN
      - Fields: use_gps, city, area, address, lat, lng

  2. Notes
    - These fields extend the existing free_tonight, out_now, out_location system
    - JSONB format allows flexible storage and querying
    - No RLS changes needed as profiles table already has proper policies
*/

-- Add ltn_preferences field to store multi-select outing types
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'ltn_preferences'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ltn_preferences jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add ltn_location field to store location details
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'ltn_location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ltn_location jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for querying users who are free tonight with specific preferences
CREATE INDEX IF NOT EXISTS idx_profiles_free_tonight_preferences
  ON profiles(free_tonight, ltn_preferences)
  WHERE free_tonight = true;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_ltn_location
  ON profiles USING gin(ltn_location)
  WHERE free_tonight = true;