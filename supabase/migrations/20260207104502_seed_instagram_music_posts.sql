/*
  # Seed Instagram Music Posts

  ## Overview
  Adds Instagram vertical video posts to the music_video_posts table.

  ## Content Added
  - 10 Instagram reels featuring:
    - DJ performances
    - Studio sessions
    - Behind the scenes content
    - Live festival moments
    - Dance videos
  - Mix of popular electronic music artists
  - Realistic descriptions and tags
*/

-- Insert Instagram video posts
INSERT INTO music_video_posts (title, artist, cover_url, content_type, instagram_url, description, genre, tags, likes, plays, is_featured) VALUES
('Studio Session Vibes', 'Charlotte de Witte', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'instagram', 'https://www.instagram.com/reel/example1', 'Working on some new heat in the studio 🔥 What do you think?', 'Techno', ARRAY['Studio', 'Production', 'NewMusic'], 3421, 89320, true),

('Sunset Set at DC10', 'Solomun', 'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg', 'instagram', 'https://www.instagram.com/reel/example2', 'Magic moments from last night at DC10 Ibiza 🌅', 'Deep House', ARRAY['Ibiza', 'DC10', 'Sunset'], 5789, 145320, true),

('Festival Energy ⚡', 'Amelie Lens', 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg', 'instagram', 'https://www.instagram.com/reel/example3', 'The energy was insane! 🔊 Thank you all', 'Techno', ARRAY['Festival', 'Live', 'Energy'], 4123, 98760, false),

('Behind The Decks', 'Tale Of Us', 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg', 'instagram', 'https://www.instagram.com/reel/example4', 'Quick mix from the hotel room before the show tonight', 'Melodic Techno', ARRAY['BTS', 'Mixing', 'Tour'], 2891, 67890, false),

('Dance Floor Moments', 'Black Coffee', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg', 'instagram', 'https://www.instagram.com/reel/example5', 'When the crowd feels the groove 💃🕺', 'Afro House', ARRAY['Dance', 'Groove', 'Party'], 6234, 187650, true),

('New Track Preview', 'Dixon', 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg', 'instagram', 'https://www.instagram.com/reel/example6', 'Snippet of my upcoming release. Out next week! 🎵', 'House', ARRAY['Preview', 'NewRelease', 'ComingSoon'], 3567, 92340, true),

('Warehouse Vibes', 'I Hate Models', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'instagram', 'https://www.instagram.com/reel/example7', 'Underground warehouse session in Berlin 🖤', 'Industrial Techno', ARRAY['Underground', 'Berlin', 'Warehouse'], 2134, 54320, false),

('Beach Club Session', 'Kungs', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg', 'instagram', 'https://www.instagram.com/reel/example8', 'Sunset vibes at the beach club 🏖️☀️', 'House', ARRAY['Beach', 'Sunset', 'Chill'], 4890, 123450, false),

('Soundcheck Time', 'Adam Beyer', 'https://images.pexels.com/photos/1763036/pexels-photo-1763036.jpeg', 'instagram', 'https://www.instagram.com/reel/example9', 'Getting ready for tonight at Awakenings 🔊', 'Techno', ARRAY['Soundcheck', 'Awakenings', 'Live'], 3789, 87650, false),

('Dance Challenge', 'Peggy Gou', 'https://images.pexels.com/photos/1944506/pexels-photo-1944506.jpeg', 'instagram', 'https://www.instagram.com/reel/example10', 'Join the dance challenge with my new track! 💃', 'House', ARRAY['Dance', 'Challenge', 'Fun'], 7891, 234890, true);