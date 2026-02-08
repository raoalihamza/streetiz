/*
  # Seed Profile Media and Music Demo Data

  1. Purpose
    - Add demo photos to profile_photos table (9 photos per user, 3x3 grid)
    - Add demo videos to profile_videos table (up to 6 videos per user)
    - Add music links to profiles table for Spotify/Deezer/SoundCloud embeds

  2. Users Targeted
    - stella_spin (DJ)
    - blaze_rhythm (DJ/Producer)
    - lumy_dance (Dancer)
    - miavibes (Artist)
    - echo_bass (Producer)
    - phoenix_flow (Artist)

  3. Content Types
    - Photos: Club events, performances, behind-the-scenes
    - Videos: DJ sets, performances, highlights
    - Music: Spotify/Deezer/SoundCloud playlists and tracks
*/

-- Add photos for stella_spin
INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  0
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  1
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
  2
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
  3
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
  4
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400&h=400&fit=crop',
  5
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

-- Add videos for stella_spin
INSERT INTO profile_videos (user_id, url, thumb_url, order_index)
SELECT 
  id,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&h=450&fit=crop',
  0
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO profile_videos (user_id, url, thumb_url, order_index)
SELECT 
  id,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=450&fit=crop',
  1
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

-- Add music link for stella_spin
UPDATE profiles
SET music_url = 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd',
    music_type = 'Playlist'
WHERE username = 'stella_spin';

-- Add photos for blaze_rhythm
INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
  0
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
  1
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400&h=400&fit=crop',
  2
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
  3
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

-- Add music link for blaze_rhythm
UPDATE profiles
SET music_url = 'https://soundcloud.com/example/techno-mix',
    music_type = 'Mix'
WHERE username = 'blaze_rhythm';

-- Add photos for lumy_dance
INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400&h=400&fit=crop',
  0
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
  1
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=400&fit=crop',
  2
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1547153760-18fc86324498?w=400&h=400&fit=crop',
  3
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1545128485-c400e7702796?w=400&h=400&fit=crop',
  4
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

-- Add videos for lumy_dance
INSERT INTO profile_videos (user_id, url, thumb_url, order_index)
SELECT 
  id,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&h=450&fit=crop',
  0
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

-- Add photos for miavibes
INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
  0
FROM profiles WHERE username = 'miavibes' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=400&fit=crop',
  1
FROM profiles WHERE username = 'miavibes' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  2
FROM profiles WHERE username = 'miavibes' LIMIT 1;

-- Add music link for miavibes
UPDATE profiles
SET music_url = 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp',
    music_type = 'Track'
WHERE username = 'miavibes';

-- Add photos for echo_bass
INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
  0
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
  1
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
  2
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=400&fit=crop',
  3
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
  4
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
  5
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=400&h=400&fit=crop',
  6
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

-- Add music link for echo_bass
UPDATE profiles
SET music_url = 'https://www.deezer.com/playlist/1313621735',
    music_type = 'Playlist'
WHERE username = 'echo_bass';

-- Add photos for phoenix_flow
INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?w=400&h=400&fit=crop',
  0
FROM profiles WHERE username = 'phoenix_flow' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=400&fit=crop',
  1
FROM profiles WHERE username = 'phoenix_flow' LIMIT 1;

INSERT INTO profile_photos (user_id, url, order_index)
SELECT 
  id,
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  2
FROM profiles WHERE username = 'phoenix_flow' LIMIT 1;