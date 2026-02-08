/*
  # Add Libre Tonight (LTN) System

  1. Changes to profiles table
    - Add `available_tonight` (boolean) - Indicates if user is available tonight
    - Add `tonight_location_type` (text) - Type: "club" or "manual"
    - Add `tonight_location_value` (text) - Club name or manual location string
    - Add `available_tonight_updated_at` (timestamptz) - Last update timestamp
    
  2. Purpose
    - Replace old free_tonight/out_now with streamlined LTN system
    - Allow users to set availability with specific location
    - Display status prominently in profile header
    - Show timestamp for freshness of availability
*/

-- Add LTN fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'available_tonight'
  ) THEN
    ALTER TABLE profiles ADD COLUMN available_tonight boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tonight_location_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tonight_location_type text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'tonight_location_value'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tonight_location_value text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'available_tonight_updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN available_tonight_updated_at timestamptz;
  END IF;
END $$;

-- Create index for quick lookup of available users
CREATE INDEX IF NOT EXISTS idx_profiles_available_tonight ON profiles(available_tonight) WHERE available_tonight = true;