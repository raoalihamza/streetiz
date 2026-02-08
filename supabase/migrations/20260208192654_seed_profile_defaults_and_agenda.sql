/*
  # Seed Profile Defaults and Sample Agenda Events

  1. Purpose
    - Add default banner and avatar URLs to existing profiles
    - Create sample agenda events for demonstration
    - Set default values for profiles without media
  
  2. Updates
    - Updates profiles with default banner and avatar URLs where null
    - Inserts sample agenda events for multiple users
  
  3. Sample Data
    - Default images from Pexels CDN
    - Realistic agenda events (club nights, festivals, workshops)
    - Various event types and locations
*/

-- Update profiles with default banner and avatar URLs where they are null
UPDATE profiles
SET 
  banner_url = COALESCE(banner_url, 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1920'),
  avatar_url = COALESCE(avatar_url, 'https://images.pexels.com/photos/1804913/pexels-photo-1804913.jpeg?auto=compress&cs=tinysrgb&w=400')
WHERE banner_url IS NULL OR avatar_url IS NULL;

-- Clear existing demo agenda events to avoid duplicates
DELETE FROM user_agenda_events
WHERE user_id IN (
  '62c3c535-cf4d-4b8e-b590-45e70d106578',
  '295caf8d-daad-479e-9ca8-39a5f975ec23',
  '105d3021-8d6b-480b-8205-b32d8e709bf2',
  '0416d585-d257-4ef6-922f-7db55841d9d7',
  'f9cbe6ed-f295-4221-ab81-75f4db718ea0',
  '5b63fb0d-620a-4321-bca2-fd01bcdeccce'
);

-- Seed sample agenda events for various users
INSERT INTO user_agenda_events (user_id, event_date, title, location, event_type)
VALUES
  -- Stella's events
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    NOW() + INTERVAL '6 hours',
    'En soirée actuellement',
    'Flow Paris',
    'performance'
  ),
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    NOW() + INTERVAL '11 days',
    'Boiler Room x Teknomade',
    'Le Port de la Lune, Bordeaux',
    'performance'
  ),
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    NOW() + INTERVAL '17 days',
    'Afro House Sunset',
    'Moon Beach Club, Nice',
    'performance'
  ),
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    NOW() + INTERVAL '19 days',
    'We Love Electro',
    'Montreuil, Paris',
    'event'
  ),
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    NOW() + INTERVAL '26 days',
    'Road to Electro Rome',
    'Rome, Italy',
    'event'
  ),
  -- Thunder's events
  (
    '295caf8d-daad-479e-9ca8-39a5f975ec23',
    NOW() + INTERVAL '3 days',
    'Thunder Festival 2026',
    'Parc des Expositions, Paris',
    'event'
  ),
  (
    '295caf8d-daad-479e-9ca8-39a5f975ec23',
    NOW() + INTERVAL '15 days',
    'Underground Warehouse Party',
    'Secret Location, Lyon',
    'event'
  ),
  (
    '295caf8d-daad-479e-9ca8-39a5f975ec23',
    NOW() + INTERVAL '28 days',
    'Summer Techno Marathon',
    'Marseille',
    'event'
  ),
  -- Blaze's events
  (
    '105d3021-8d6b-480b-8205-b32d8e709bf2',
    NOW() + INTERVAL '5 days',
    'Closing Set @ Concrete',
    'Concrete, Paris',
    'performance'
  ),
  (
    '105d3021-8d6b-480b-8205-b32d8e709bf2',
    NOW() + INTERVAL '12 days',
    'B2B with Ben Klock',
    'Berghain, Berlin',
    'performance'
  ),
  (
    '105d3021-8d6b-480b-8205-b32d8e709bf2',
    NOW() + INTERVAL '21 days',
    'Techno Masterclass',
    'Studio 808, Paris',
    'workshop'
  ),
  -- Mia Vibes' events
  (
    '0416d585-d257-4ef6-922f-7db55841d9d7',
    NOW() + INTERVAL '7 days',
    'Deep House Session',
    'Rex Club, Paris',
    'performance'
  ),
  (
    '0416d585-d257-4ef6-922f-7db55841d9d7',
    NOW() + INTERVAL '14 days',
    'Collaboratif Workshop',
    'Point Éphémère, Paris',
    'workshop'
  ),
  (
    '0416d585-d257-4ef6-922f-7db55841d9d7',
    NOW() + INTERVAL '25 days',
    'Sunset Rooftop',
    'Le Perchoir, Paris',
    'performance'
  ),
  -- Kosmo's events
  (
    'f9cbe6ed-f295-4221-ab81-75f4db718ea0',
    NOW() + INTERVAL '9 days',
    'Dark Techno Night',
    'La Machine du Moulin Rouge, Paris',
    'performance'
  ),
  (
    'f9cbe6ed-f295-4221-ab81-75f4db718ea0',
    NOW() + INTERVAL '20 days',
    'Industrial Rave',
    'Warehouse District, Berlin',
    'event'
  ),
  -- Lumy's events
  (
    '5b63fb0d-620a-4321-bca2-fd01bcdeccce',
    NOW() + INTERVAL '4 days',
    'Dance Battle Championship',
    'Le Trabendo, Paris',
    'battle'
  ),
  (
    '5b63fb0d-620a-4321-bca2-fd01bcdeccce',
    NOW() + INTERVAL '13 days',
    'Hip-Hop Workshop',
    'Studio Harmonic, Paris',
    'workshop'
  ),
  (
    '5b63fb0d-620a-4321-bca2-fd01bcdeccce',
    NOW() + INTERVAL '22 days',
    'Urban Dance Festival',
    'La Villette, Paris',
    'event'
  );

-- Set some users as free_tonight for demo purposes
UPDATE profiles
SET free_tonight = true
WHERE id IN (
  '5b63fb0d-620a-4321-bca2-fd01bcdeccce',  -- lumy_dance
  '78a9ab79-c87f-46d9-9833-ba7283c86f90'   -- lexamotion
);

-- Set one user as out_now
UPDATE profiles
SET 
  out_now = true,
  out_location = 'Flow Paris',
  out_since = NOW()
WHERE id = '62c3c535-cf4d-4b8e-b590-45e70d106578';  -- stella_spin
