/*
  # Update Online Status for Activity Feed

  1. Purpose
    - Sets some users as online to populate the activity feed
    - Updates last_seen timestamps to current time
  
  2. Updates
    - Sets online_status to 'online' for several active users
    - Updates last_seen to NOW() for realistic timestamps
*/

-- Update profile_extensions to set users as online
UPDATE profile_extensions
SET 
  online_status = 'online',
  last_seen = NOW()
WHERE id IN (
  '62c3c535-cf4d-4b8e-b590-45e70d106578',  -- stella_spin
  '105d3021-8d6b-480b-8205-b32d8e709bf2',  -- blaze_rhythm
  '5b63fb0d-620a-4321-bca2-fd01bcdeccce',  -- lumy_dance
  '78a9ab79-c87f-46d9-9833-ba7283c86f90'   -- lexamotion
);

-- Insert profile_extensions for users that don't have one yet (if needed)
INSERT INTO profile_extensions (id, online_status, last_seen)
SELECT id, 'online', NOW()
FROM profiles
WHERE id IN (
  '62c3c535-cf4d-4b8e-b590-45e70d106578',
  '105d3021-8d6b-480b-8205-b32d8e709bf2',
  '5b63fb0d-620a-4321-bca2-fd01bcdeccce',
  '78a9ab79-c87f-46d9-9833-ba7283c86f90'
)
ON CONFLICT (id) DO UPDATE
SET 
  online_status = 'online',
  last_seen = NOW();
