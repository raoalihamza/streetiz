/*
  # Add Avatar and Banner URLs to Profiles

  1. Changes
    - Add `avatar_url` column to profiles table for profile pictures
    - Add `banner_url` column to profiles table for cover images
  
  2. Notes
    - These columns store image URLs (can be data URLs or external URLs)
    - Both fields are nullable and have text type for flexibility
    - Support for base64 data URLs and external image URLs
*/

-- Add avatar_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Add banner_url column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;
END $$;