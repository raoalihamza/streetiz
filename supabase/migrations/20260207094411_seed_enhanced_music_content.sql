/*
  # Seed Enhanced Music Content

  Seeds comprehensive demo data for the new Spotify-style music page:
  - Spotlight hero content
  - Discover Weekly playlist and tracks
  - Platform releases from Spotify/Deezer/SoundCloud
  - Remixes and free downloads
  - Updates existing tracks with new fields
*/

-- Update existing tracks with new fields
UPDATE music_tracks SET
  is_remix = (random() < 0.3),
  is_free_download = (random() < 0.2),
  platform = CASE 
    WHEN random() < 0.3 THEN 'spotify'
    WHEN random() < 0.5 THEN 'soundcloud'
    WHEN random() < 0.7 THEN 'deezer'
    ELSE 'beatport'
  END,
  bpm = 120 + floor(random() * 50)::integer,
  mood_tags = ARRAY['Energetic', 'Dark']::text[]
WHERE true;

-- Insert Spotlight content
INSERT INTO music_spotlights (title, subtitle, cover_url, content_type, tags, external_url, is_active, priority)
VALUES 
  (
    'ELECTRO SUMMER 2025',
    'The Ultimate Electro House Compilation',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'playlist',
    ARRAY['Playlist', 'Electro', 'New']::text[],
    'https://open.spotify.com/playlist/example',
    true,
    100
  );

-- Insert Discover Weekly playlist
INSERT INTO music_playlists (title, description, cover_url, curator, track_count, is_featured, playlist_type, tags)
VALUES 
  (
    'Discover Weekly - Electro Edition',
    'Your personalized weekly mix of electro bangers',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
    'Streetiz',
    50,
    true,
    'discover_weekly',
    ARRAY['Electro', 'House', 'Techno']::text[]
  );

-- Insert Platform Releases
INSERT INTO music_platform_releases (title, artist, cover_url, platform, external_url, release_type, genres, is_new)
VALUES 
  -- Spotify Releases
  (
    'Midnight Drive',
    'DJ Shadow',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400',
    'spotify',
    'https://open.spotify.com',
    'new',
    ARRAY['Electro', 'House']::text[],
    true
  ),
  (
    'Neon Lights',
    'Electric Dreams',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
    'spotify',
    'https://open.spotify.com',
    'new',
    ARRAY['Techno']::text[],
    true
  ),
  (
    'Underground Vibes',
    'Bass King',
    'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400',
    'spotify',
    'https://open.spotify.com',
    'album',
    ARRAY['Electro']::text[],
    true
  ),
  
  -- Deezer Releases
  (
    'Festival Energy',
    'Rave Master',
    'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg?auto=compress&cs=tinysrgb&w=400',
    'deezer',
    'https://deezer.com',
    'new',
    ARRAY['House', 'Electro']::text[],
    true
  ),
  (
    'Dark Frequencies',
    'Tech Noir',
    'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=400',
    'deezer',
    'https://deezer.com',
    'ep',
    ARRAY['Techno']::text[],
    true
  ),
  
  -- SoundCloud Releases
  (
    'Street Electro Vol. 3',
    'Urban Beats',
    'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=400',
    'soundcloud',
    'https://soundcloud.com',
    'new',
    ARRAY['Electro', 'Breakbeat']::text[],
    true
  ),
  (
    'Tecktonik Revival',
    'French Touch',
    'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400',
    'soundcloud',
    'https://soundcloud.com',
    'remix',
    ARRAY['Electro', 'Tecktonik']::text[],
    true
  ),
  
  -- Beatport Releases
  (
    'Warehouse Sessions',
    'Minimal Tribe',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=400',
    'beatport',
    'https://beatport.com',
    'new',
    ARRAY['Techno', 'Minimal']::text[],
    true
  ),
  (
    'Afro House Anthem',
    'Rhythm Collective',
    'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg?auto=compress&cs=tinysrgb&w=400',
    'beatport',
    'https://beatport.com',
    'single',
    ARRAY['Afro House']::text[],
    true
  ),
  
  -- YouTube Releases
  (
    'Dance Explosion 2025',
    'Street Dancers',
    'https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg?auto=compress&cs=tinysrgb&w=400',
    'youtube',
    'https://youtube.com',
    'new',
    ARRAY['Electro', 'Dance']::text[],
    true
  ),
  (
    'Rave Generation',
    'Old School Crew',
    'https://images.pexels.com/photos/1677710/pexels-photo-1677710.jpeg?auto=compress&cs=tinysrgb&w=400',
    'youtube',
    'https://youtube.com',
    'compilation',
    ARRAY['House', 'Rave']::text[],
    true
  ),
  (
    'Berlin Underground',
    'Techno Warriors',
    'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=400',
    'youtube',
    'https://youtube.com',
    'new',
    ARRAY['Techno']::text[],
    true
  ),
  (
    'Bass Revolution',
    'Sub Frequency',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
    'spotify',
    'https://open.spotify.com',
    'new',
    ARRAY['Electro', 'Bass']::text[],
    true
  ),
  (
    'Melodic Dreams',
    'Progressive Union',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400',
    'deezer',
    'https://deezer.com',
    'album',
    ARRAY['House', 'Melodic']::text[],
    true
  ),
  (
    'Peak Time Anthems',
    'Prime Time DJ',
    'https://images.pexels.com/photos/1845218/pexels-photo-1845218.jpeg?auto=compress&cs=tinysrgb&w=400',
    'beatport',
    'https://beatport.com',
    'new',
    ARRAY['Techno', 'Peak']::text[],
    true
  );

-- Insert Podcasts
INSERT INTO music_podcasts (title, host, cover_url, audio_url, description, duration, episode_number)
VALUES 
  (
    'Streetiz Sessions Episode 12',
    'DJ Maxime',
    'https://images.pexels.com/photos/8038392/pexels-photo-8038392.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://example.com/audio/podcast1.mp3',
    'Deep dive into the French electro scene with exclusive interviews',
    3600,
    12
  ),
  (
    'The Tecktonik Revival',
    'Marie Laurent',
    'https://images.pexels.com/photos/7649700/pexels-photo-7649700.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://example.com/audio/podcast2.mp3',
    'Exploring the comeback of Tecktonik dance culture in 2025',
    2700,
    8
  ),
  (
    'Underground Frequencies',
    'Tech Collective',
    'https://images.pexels.com/photos/7649698/pexels-photo-7649698.jpeg?auto=compress&cs=tinysrgb&w=400',
    'https://example.com/audio/podcast3.mp3',
    'The best underground techno from Berlin to Paris',
    4200,
    25
  );
