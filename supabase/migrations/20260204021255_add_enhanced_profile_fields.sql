/*
  # Add Enhanced Profile Fields

  1. Profile Extensions
    - Add cover_banner_url (text)
    - Update bio constraint (max 500 chars)
    - Add city, country, latitude, longitude for location
    - Add nationality, team_collective
    - Add roles (jsonb array)
    - Add styles (jsonb array)
    - Add social_links (jsonb object)

  2. Indexes
    - Add location index for geo-based searches
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_banner_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS latitude numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longitude numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_collective text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS styles jsonb DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;

-- Add/update bio length constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_bio_length;
ALTER TABLE profiles ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 500);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON profiles USING gin(roles);
CREATE INDEX IF NOT EXISTS idx_profiles_styles ON profiles USING gin(styles);
