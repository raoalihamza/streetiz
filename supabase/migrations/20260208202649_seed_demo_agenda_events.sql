/*
  # Seed Demo Agenda Events

  1. Purpose
    - Add demonstration events to user agendas
    - Show variety of event types: performances, battles, workshops, events
    - Include both upcoming and current events
    - Populate agendas for multiple users to demonstrate the feature

  2. Event Types
    - performance: DJ sets, live performances
    - battle: Dance battles, rap battles
    - workshop: Classes, teaching sessions
    - event: General events, parties, festivals

  3. Data Added
    - Multiple events for different users
    - Mix of dates (today, tomorrow, next week, next month)
    - Various locations and event types
    - Events with looking_for_plus_one enabled and disabled
*/

-- Add events for DJ Shadow (assuming user exists)
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Techno Night @ Warehouse 404',
  CURRENT_DATE + 2,
  'performance',
  'Warehouse 404, Paris',
  'Closing set with special guests. Industrial techno vibes all night long.',
  true,
  2
FROM profiles WHERE username = 'djshadow' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Underground Sessions',
  CURRENT_DATE + 5,
  'performance',
  'Le Connexion Live, Toulouse',
  'Deep house and minimal techno. Intimate venue, limited capacity.',
  false,
  0
FROM profiles WHERE username = 'djshadow' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Festival Nuits Sonores',
  CURRENT_DATE + 15,
  'event',
  'Lyon',
  'Main stage performance at 2AM. 5 hour set.',
  true,
  3
FROM profiles WHERE username = 'djshadow' LIMIT 1;

-- Add events for Luna Bass
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Bass Music Production Workshop',
  CURRENT_DATE + 3,
  'workshop',
  'Studio 808, Marseille',
  'Teaching bass synthesis and sound design techniques. Bring your laptop!',
  true,
  1
FROM profiles WHERE username = 'lunabass' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'DNB Night @ Le Rex',
  CURRENT_DATE + 7,
  'performance',
  'Le Rex Club, Paris',
  'Drum & Bass takeover. Heavy basslines guaranteed.',
  true,
  2
FROM profiles WHERE username = 'lunabass' LIMIT 1;

-- Add events for B-Boy Thunder
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Street Dance Battle',
  CURRENT_DATE + 1,
  'battle',
  'Place de la République, Paris',
  '2v2 breaking battle. Cash prizes for winners.',
  false,
  0
FROM profiles WHERE username = 'bboythunder' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Hip Hop Foundations Workshop',
  CURRENT_DATE + 4,
  'workshop',
  'Centre Culturel, Lyon',
  'Teaching fundamental moves and flow. All levels welcome.',
  true,
  2
FROM profiles WHERE username = 'bboythunder' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'International Breaking Championship',
  CURRENT_DATE + 20,
  'battle',
  'AccorHotels Arena, Paris',
  'Competing in the finals. Wish me luck!',
  true,
  3
FROM profiles WHERE username = 'bboythunder' LIMIT 1;

-- Add events for Urban Vibe
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Graffiti & Street Art Expo',
  CURRENT_DATE + 6,
  'event',
  'Galerie Itinerrance, Paris',
  'Showcasing my latest pieces. Opening night with live performances.',
  true,
  2
FROM profiles WHERE username = 'urbanvibe' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Spray Can Techniques Masterclass',
  CURRENT_DATE + 10,
  'workshop',
  'Urban Art Studio, Bordeaux',
  'Teaching advanced spray techniques and color theory.',
  false,
  0
FROM profiles WHERE username = 'urbanvibe' LIMIT 1;

-- Add events for MC Flow
INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Rap Cypher Session',
  CURRENT_DATE + 1,
  'event',
  'La Place Hip Hop, Paris',
  'Open mic freestyle session. Come spit bars!',
  true,
  1
FROM profiles WHERE username = 'mcflow' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Rap Battle Championship',
  CURRENT_DATE + 8,
  'battle',
  'Le Trianon, Paris',
  '1v1 battle rap. Bring your best bars.',
  false,
  0
FROM profiles WHERE username = 'mcflow' LIMIT 1;

INSERT INTO user_agenda_events (user_id, title, event_date, event_type, location, description, looking_for_plus_one, available_spots)
SELECT 
  id,
  'Album Release Party',
  CURRENT_DATE + 25,
  'event',
  'Bataclan, Paris',
  'Celebrating the release of my new album with live band.',
  true,
  5
FROM profiles WHERE username = 'mcflow' LIMIT 1;