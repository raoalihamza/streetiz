/*
  # Seed More Demo Agenda Events V2

  1. Purpose
    - Add demonstration events to existing user agendas
    - Use real usernames that exist in the database
    - Show variety of event types: performances, battles, workshops, events
    - Include both upcoming events (tomorrow, next week, next month)
    - Respect available_spots constraint (max 3)

  2. Event Types
    - performance: DJ sets, live performances
    - battle: Dance battles, competitions
    - workshop: Classes, teaching sessions
    - event: General events, parties, festivals

  3. Users Targeted
    - blaze_rhythm (DJ/Producer)
    - stella_spin (DJ)
    - lumy_dance (Dancer)
    - miavibes (Artist)
    - echo_bass (Producer)
    - phoenix_flow (Artist)
*/

-- Add events for blaze_rhythm
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Techno Warehouse Party',
  CURRENT_DATE + 2,
  'performance',
  'Warehouse 404, Lyon',
  'Underground techno session. Dark and heavy sounds.',
  true,
  2,
  '#dc2626'
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Afterhours @ La Machine',
  CURRENT_DATE + 9,
  'performance',
  'La Machine du Moulin Rouge, Paris',
  'Closing the night with industrial techno.',
  false,
  0,
  '#dc2626'
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Nuits Sonores Festival',
  CURRENT_DATE + 28,
  'event',
  'Lyon',
  'Main stage 3-hour set. Biggest gig of the year!',
  true,
  3,
  '#dc2626'
FROM profiles WHERE username = 'blaze_rhythm' LIMIT 1;

-- Add events for stella_spin
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'House Music Vinyl Session',
  CURRENT_DATE + 3,
  'performance',
  'Le Sucre, Lyon',
  'All vinyl set. Classic house vibes.',
  true,
  1,
  '#dc2626'
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Rooftop Sunset Session',
  CURRENT_DATE + 14,
  'performance',
  'Le Perchoir, Paris',
  'Sunset house music with amazing views.',
  true,
  2,
  '#dc2626'
FROM profiles WHERE username = 'stella_spin' LIMIT 1;

-- Add events for lumy_dance
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Dance Battle: Paris vs Lyon',
  CURRENT_DATE + 1,
  'battle',
  'Dock Pullman, Paris',
  'Representing Paris! 3v3 crew battle.',
  false,
  0,
  '#dc2626'
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Contemporary Dance Workshop',
  CURRENT_DATE + 5,
  'workshop',
  'Studio Harmonic, Paris',
  'Teaching fusion techniques. Intermediate level.',
  true,
  3,
  '#2563eb'
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'European Dance Championship',
  CURRENT_DATE + 30,
  'battle',
  'Amsterdam, Netherlands',
  'Finals! Competing in the solo category.',
  true,
  2,
  '#dc2626'
FROM profiles WHERE username = 'lumy_dance' LIMIT 1;

-- Add events for miavibes
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Live Electronic Performance',
  CURRENT_DATE + 4,
  'performance',
  'Point Éphémère, Paris',
  'Modular synth live set. Experimental sounds.',
  true,
  1,
  '#dc2626'
FROM profiles WHERE username = 'miavibes' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Sound Design Workshop',
  CURRENT_DATE + 11,
  'workshop',
  'Studio 808, Marseille',
  'Teaching modular synthesis basics.',
  false,
  0,
  '#2563eb'
FROM profiles WHERE username = 'miavibes' LIMIT 1;

-- Add events for echo_bass
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Bass Music Night',
  CURRENT_DATE + 6,
  'performance',
  'Le Rex Club, Paris',
  'Drum & Bass and Dubstep. Heavy bass guaranteed.',
  true,
  2,
  '#dc2626'
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Production Masterclass',
  CURRENT_DATE + 12,
  'workshop',
  'Ableton HQ, Berlin',
  'Advanced bass music production techniques.',
  true,
  1,
  '#2563eb'
FROM profiles WHERE username = 'echo_bass' LIMIT 1;

-- Add events for phoenix_flow
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Art & Music Festival',
  CURRENT_DATE + 7,
  'event',
  'Parc de la Villette, Paris',
  'Live painting while DJs play. Art meets music.',
  true,
  3,
  '#dc2626'
FROM profiles WHERE username = 'phoenix_flow' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots, color)
SELECT 
  id,
  'Creative Workshop: Art + Sound',
  CURRENT_DATE + 16,
  'workshop',
  'La Générale, Paris',
  'Exploring the intersection of visual art and music.',
  true,
  2,
  '#2563eb'
FROM profiles WHERE username = 'phoenix_flow' LIMIT 1;