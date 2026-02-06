/*
  # Seed Enhanced Profile Data

  1. Updates
    - Update existing profiles with enhanced fields
    - Add roles, styles, locations, nationalities, team names
    - Add social links
    - Add profile media (photos and videos)

  2. Sample Data
    - Diverse roles: DJ, Dancer, Organizer, Clubber, Videographer, Photographer
    - Multiple cities and nationalities
    - Sample media galleries (photos and videos)
*/

-- Update existing profiles with enhanced data
UPDATE profiles SET
  bio = 'Electro Dance DJ & Producer from Paris. Playing the hottest tracks and representing the French Touch worldwide!',
  city = 'Paris',
  country = 'France',
  latitude = 48.8566,
  longitude = 2.3522,
  nationality = 'French',
  team_collective = 'Streetiz Crew',
  roles = '["DJ", "Organizer"]'::jsonb,
  styles = '["Electro Dance", "Tecktonik", "French Touch", "House"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/djstreetiz", "youtube": "https://youtube.com/djstreetiz", "soundcloud": "https://soundcloud.com/djstreetiz"}'::jsonb
WHERE username = 'dj_mike' AND city IS NULL;

UPDATE profiles SET
  bio = 'Professional Electro Dance performer. 10+ years experience. Teaching classes and battling worldwide.',
  city = 'Lyon',
  country = 'France',
  latitude = 45.7640,
  longitude = 4.8357,
  nationality = 'French',
  team_collective = 'Lyon Killers',
  roles = '["Dancer", "Coach"]'::jsonb,
  styles = '["Electro Dance", "Tecktonik", "Hardstyle"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/sarahdance", "tiktok": "https://tiktok.com/@sarahdance"}'::jsonb
WHERE username = 'sarah_k' AND city IS NULL;

UPDATE profiles SET
  bio = 'Event organizer and promoter. Creating the best Electro Dance experiences in Belgium!',
  city = 'Brussels',
  country = 'Belgium',
  latitude = 50.8503,
  longitude = 4.3517,
  nationality = 'Belgian',
  team_collective = 'Brussels Events',
  roles = '["Organizer", "DJ"]'::jsonb,
  styles = '["House", "Techno", "Trance"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/alexevents", "other": "https://brusselsevents.com"}'::jsonb
WHERE username = 'alex_beats' AND city IS NULL;

UPDATE profiles SET
  bio = 'Videographer capturing the energy of street dance culture. Available for events and music videos.',
  city = 'Amsterdam',
  country = 'Netherlands',
  latitude = 52.3676,
  longitude = 4.9041,
  nationality = 'Dutch',
  roles = '["Videographer", "Photographer"]'::jsonb,
  styles = '["House", "Afro House"]'::jsonb,
  social_links = '{"youtube": "https://youtube.com/marcovideo", "instagram": "https://instagram.com/marcovideo"}'::jsonb
WHERE username = 'marco_m' AND city IS NULL;

UPDATE profiles SET
  bio = 'Club enthusiast and dance music lover. Always at the best parties! Hit me up for event recommendations.',
  city = 'Berlin',
  country = 'Germany',
  latitude = 52.5200,
  longitude = 13.4050,
  nationality = 'German',
  team_collective = 'Berlin Night Owls',
  roles = '["Clubber"]'::jsonb,
  styles = '["Techno", "House", "Trance"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/emmadance"}'::jsonb
WHERE username = 'emma_d' AND city IS NULL;

UPDATE profiles SET
  bio = 'MC and hype man. Bringing the energy to every event. Book me for your next party!',
  city = 'London',
  country = 'UK',
  latitude = 51.5074,
  longitude = -0.1278,
  nationality = 'British',
  team_collective = 'UK Hype Squad',
  roles = '["MC", "Organizer"]'::jsonb,
  styles = '["House", "UK Garage", "Electro Dance"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/tommc", "tiktok": "https://tiktok.com/@tommc"}'::jsonb
WHERE username = 'tom_p' AND city IS NULL;

UPDATE profiles SET
  bio = 'Tecktonik dancer since 2007. Teaching the classic moves and creating new styles!',
  city = 'Marseille',
  country = 'France',
  latitude = 43.2965,
  longitude = 5.3698,
  nationality = 'French',
  team_collective = 'Marseille Tecktonik',
  roles = '["Dancer", "Coach"]'::jsonb,
  styles = '["Tecktonik", "Electro Dance", "Hardstyle"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/juliadance", "youtube": "https://youtube.com/juliadance"}'::jsonb
WHERE username = 'julia_dance' AND city IS NULL;

UPDATE profiles SET
  bio = 'Hardstyle DJ and producer. Playing the hardest beats in the scene!',
  city = 'Rotterdam',
  country = 'Netherlands',
  latitude = 51.9225,
  longitude = 4.4792,
  nationality = 'Dutch',
  team_collective = 'Rotterdam Raw',
  roles = '["DJ"]'::jsonb,
  styles = '["Hardstyle", "Hardcore", "Techno"]'::jsonb,
  social_links = '{"soundcloud": "https://soundcloud.com/chrishardstyle", "spotify": "https://spotify.com/chrishardstyle"}'::jsonb
WHERE username = 'chris_sound' AND city IS NULL;

UPDATE profiles SET
  bio = 'Professional photographer specializing in dance and club photography. Available for bookings!',
  city = 'Barcelona',
  country = 'Spain',
  latitude = 41.3851,
  longitude = 2.1734,
  nationality = 'Spanish',
  roles = '["Photographer", "Videographer"]'::jsonb,
  styles = '["House", "Techno"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/ninaphoto", "other": "https://ninaphoto.com"}'::jsonb
WHERE username = 'nina_photo' AND city IS NULL;

UPDATE profiles SET
  bio = 'Breaking and Electro Dance fusion. Creating unique styles and teaching workshops worldwide.',
  city = 'Milan',
  country = 'Italy',
  latitude = 45.4642,
  longitude = 9.1900,
  nationality = 'Italian',
  team_collective = 'Milan Breakers',
  roles = '["Dancer", "Crew"]'::jsonb,
  styles = '["Electro Dance", "Breaking", "House"]'::jsonb,
  social_links = '{"instagram": "https://instagram.com/lucadance", "tiktok": "https://tiktok.com/@lucadance"}'::jsonb
WHERE username = 'luca_b' AND city IS NULL;

-- Add sample profile media using user_id column
INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg',
  0
FROM profiles p WHERE p.username = 'dj_mike' 
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg',
  1
FROM profiles p WHERE p.username = 'dj_mike'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 1 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg',
  2
FROM profiles p WHERE p.username = 'dj_mike'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 2 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, external_url, external_platform, display_order)
SELECT 
  p.id,
  'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube',
  0
FROM profiles p WHERE p.username = 'dj_mike'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'video');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/3764579/pexels-photo-3764579.jpeg',
  0
FROM profiles p WHERE p.username = 'sarah_k'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/3721941/pexels-photo-3721941.jpeg',
  1
FROM profiles p WHERE p.username = 'sarah_k'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 1 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/3621953/pexels-photo-3621953.jpeg',
  2
FROM profiles p WHERE p.username = 'sarah_k'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 2 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/3621954/pexels-photo-3621954.jpeg',
  3
FROM profiles p WHERE p.username = 'sarah_k'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 3 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/2479312/pexels-photo-2479312.jpeg',
  0
FROM profiles p WHERE p.username = 'marco_m'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg',
  1
FROM profiles p WHERE p.username = 'marco_m'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 1 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1309240/pexels-photo-1309240.jpeg',
  2
FROM profiles p WHERE p.username = 'marco_m'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 2 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg',
  3
FROM profiles p WHERE p.username = 'marco_m'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 3 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/2564869/pexels-photo-2564869.jpeg',
  4
FROM profiles p WHERE p.username = 'marco_m'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 4 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, external_url, external_platform, display_order)
SELECT 
  p.id,
  'video',
  'https://www.youtube.com/watch?v=jNQXAC9IVRw',
  'youtube',
  0
FROM profiles p WHERE p.username = 'marco_m'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'video');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/3756985/pexels-photo-3756985.jpeg',
  0
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
  1
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 1 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
  2
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 2 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg',
  3
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 3 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg',
  4
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 4 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, media_url, display_order)
SELECT 
  p.id,
  'photo',
  'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
  5
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 5 AND media_type = 'photo');

INSERT INTO profile_media (user_id, media_type, external_url, external_platform, display_order)
SELECT 
  p.id,
  'video',
  'https://www.youtube.com/watch?v=9bZkp7q19f0',
  'youtube',
  0
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 0 AND media_type = 'video');

INSERT INTO profile_media (user_id, media_type, external_url, external_platform, display_order)
SELECT 
  p.id,
  'video',
  'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  'youtube',
  1
FROM profiles p WHERE p.username = 'nina_photo'
AND NOT EXISTS (SELECT 1 FROM profile_media WHERE user_id = p.id AND display_order = 1 AND media_type = 'video');
