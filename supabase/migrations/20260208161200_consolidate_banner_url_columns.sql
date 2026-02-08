/*
  # Consolidate Banner URL Columns

  1. Changes
    - Migrate data from `cover_banner_url` to `banner_url`
    - Remove duplicate `cover_banner_url` column
  
  2. Notes
    - Ensures banner data is preserved during consolidation
    - Uses banner_url as the single source of truth
*/

-- Copy data from cover_banner_url to banner_url if banner_url is null
UPDATE profiles
SET banner_url = cover_banner_url
WHERE banner_url IS NULL AND cover_banner_url IS NOT NULL;

-- Drop the old cover_banner_url column
ALTER TABLE profiles DROP COLUMN IF EXISTS cover_banner_url;