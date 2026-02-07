/*
  # Seed Music Video Posts

  ## Overview
  Populates the music_video_posts table with sample YouTube videos and SoundCloud embeds
  featuring electronic music content.

  ## Content Added
  - 15 YouTube music videos (DJ sets, live performances, music videos)
  - 10 SoundCloud embeds (tracks, mixes, podcasts)
  - Mix of genres: House, Techno, Afro House, Tech House, Deep House
  - Realistic artist names and descriptions
*/

-- Insert YouTube video posts
INSERT INTO music_video_posts (title, artist, cover_url, content_type, youtube_url, youtube_embed_id, description, genre, tags, likes, plays, is_featured) VALUES
('Boiler Room Paris - Live Set', 'Amelie Lens', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'youtube', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'Techno heavyweight Amelie Lens delivering a powerful live set from Paris Boiler Room', 'Techno', ARRAY['Live', 'Boiler Room', 'Techno'], 1243, 45320, true),

('Cercle - Chateau de Fontainebleau', 'Kungs', 'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg', 'youtube', 'https://www.youtube.com/watch?v=abc123def45', 'abc123def45', 'Stunning DJ set in the iconic Chateau de Fontainebleau for Cercle', 'House', ARRAY['Cercle', 'Live', 'House'], 2891, 128450, true),

('HÖR Berlin - Warehouse Session', 'Kobosil', 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg', 'youtube', 'https://www.youtube.com/watch?v=xyz789ghi12', 'xyz789ghi12', 'Raw techno energy from Berlin underground', 'Techno', ARRAY['HÖR', 'Berlin', 'Underground'], 892, 32100, false),

('Music Video: Midnight Runner', 'Purple Disco Machine', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg', 'youtube', 'https://www.youtube.com/watch?v=mno345pqr67', 'mno345pqr67', 'Official music video for the summer anthem Midnight Runner', 'Disco House', ARRAY['Music Video', 'Disco', 'Summer'], 5421, 234890, true),

('Fabric London - Closing Set', 'Ben Klock', 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg', 'youtube', 'https://www.youtube.com/watch?v=stu678vwx90', 'stu678vwx90', 'Legendary closing set at Fabric London', 'Techno', ARRAY['Fabric', 'Live', 'Closing'], 1567, 67234, false),

('DJ Set at Tomorrowland 2024', 'Adam Beyer', 'https://images.pexels.com/photos/1763036/pexels-photo-1763036.jpeg', 'youtube', 'https://www.youtube.com/watch?v=bcd456efg78', 'bcd456efg78', 'Epic mainstage performance at Tomorrowland Belgium', 'Techno', ARRAY['Festival', 'Tomorrowland', 'Mainstage'], 3421, 189450, true),

('Rooftop Session - Berlin Sunset', 'Dixon', 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg', 'youtube', 'https://www.youtube.com/watch?v=hij901klm23', 'hij901klm23', 'Melodic house vibes as the sun sets over Berlin', 'Melodic House', ARRAY['Rooftop', 'Sunset', 'Berlin'], 2134, 89320, false),

('Studio Session & Interview', 'Peggy Gou', 'https://images.pexels.com/photos/1944506/pexels-photo-1944506.jpeg', 'youtube', 'https://www.youtube.com/watch?v=nop234qrs56', 'nop234qrs56', 'Exclusive studio session with Peggy Gou discussing her creative process', 'House', ARRAY['Studio', 'Interview', 'Creative'], 1789, 45670, false),

('Afro House Journey', 'Black Coffee', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg', 'youtube', 'https://www.youtube.com/watch?v=tuv789wxy01', 'tuv789wxy01', 'A spiritual journey through African rhythms and electronic beats', 'Afro House', ARRAY['Afro House', 'Live', 'Journey'], 4562, 198320, true),

('Warehouse Rave - Amsterdam', 'Amelie Lens', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'youtube', 'https://www.youtube.com/watch?v=zab345cde67', 'zab345cde67', 'Underground warehouse party in Amsterdam with brutal techno', 'Techno', ARRAY['Warehouse', 'Amsterdam', 'Underground'], 1876, 54320, false),

('Live from Ibiza - DC10 Closing', 'Carl Cox', 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg', 'youtube', 'https://www.youtube.com/watch?v=efg678hij90', 'efg678hij90', 'The legend Carl Cox closing DC10 for the season', 'Tech House', ARRAY['Ibiza', 'DC10', 'Closing'], 6789, 312450, true),

('Music Video: Electric Dreams', 'The Blessed Madonna', 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg', 'youtube', 'https://www.youtube.com/watch?v=klm012nop34', 'klm012nop34', 'Vibrant music video celebrating electronic music culture', 'House', ARRAY['Music Video', 'Culture', 'Electric'], 3214, 156780, false),

('Printworks London - Last Dance', 'Nina Kraviz', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'youtube', 'https://www.youtube.com/watch?v=qrs567tuv89', 'qrs567tuv89', 'Emotional closing set at the iconic Printworks venue', 'Techno', ARRAY['Printworks', 'Closing', 'Emotional'], 2345, 98760, true),

('Sunrise Set - Burning Man', 'Tale Of Us', 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg', 'youtube', 'https://www.youtube.com/watch?v=wxy901zab23', 'wxy901zab23', 'Magical sunrise performance in the Nevada desert', 'Melodic Techno', ARRAY['Burning Man', 'Sunrise', 'Desert'], 4123, 187650, true),

('Music Documentary: 20 Years', 'Richie Hawtin', 'https://images.pexels.com/photos/1309240/pexels-photo-1309240.jpeg', 'youtube', 'https://www.youtube.com/watch?v=cde456fgh78', 'cde456fgh78', 'Documentary exploring 20 years of electronic music evolution', 'Minimal Techno', ARRAY['Documentary', 'History', 'Evolution'], 1890, 67890, false);

-- Insert SoundCloud embed posts
INSERT INTO music_video_posts (title, artist, cover_url, content_type, soundcloud_url, description, genre, tags, likes, plays, is_featured) VALUES
('Late Night Mix Vol. 42', 'DJ Seinfeld', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg', 'soundcloud', 'https://soundcloud.com/example/latenightmix42', '2 hour journey through melodic house and lo-fi beats', 'House', ARRAY['Mix', 'Lo-Fi', 'Melodic'], 892, 23450, false),

('Underground Sounds Podcast #156', 'Streetiz Radio', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'soundcloud', 'https://soundcloud.com/streetizradio/podcast156', 'Weekly podcast featuring the best underground electronic music', 'Various', ARRAY['Podcast', 'Underground', 'Weekly'], 1234, 45670, true),

('Warehouse Therapy', 'I Hate Models', 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg', 'soundcloud', 'https://soundcloud.com/ihatemodels/warehousetherapy', 'Dark and powerful techno mix for late night sessions', 'Techno', ARRAY['Dark', 'Warehouse', 'Techno'], 2341, 78900, true),

('Tropical Rhythms', 'Bedouin', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg', 'soundcloud', 'https://soundcloud.com/bedouin/tropicalrhythms', 'Afro house grooves meets electronic soul', 'Afro House', ARRAY['Tropical', 'Grooves', 'Afro'], 1567, 56780, false),

('Melodic Journey 2024', 'Stephan Bodzin', 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg', 'soundcloud', 'https://soundcloud.com/stephanbodzin/melodicjourney', 'Exclusive melodic techno composition', 'Melodic Techno', ARRAY['Melodic', 'Journey', 'Exclusive'], 3456, 123450, true),

('Sunday Chill Session', 'Monolink', 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg', 'soundcloud', 'https://soundcloud.com/monolink/sundaychill', 'Downtempo electronica for lazy Sundays', 'Downtempo', ARRAY['Chill', 'Sunday', 'Downtempo'], 987, 34560, false),

('Peak Time Weapons Vol. 3', 'Charlotte de Witte', 'https://images.pexels.com/photos/1763036/pexels-photo-1763036.jpeg', 'soundcloud', 'https://soundcloud.com/charlottedewitte/peaktimeweapons3', 'Heavy hitters for peak time moments', 'Techno', ARRAY['Peak Time', 'Heavy', 'Bangers'], 2789, 89760, true),

('Minimal Monday Mix', 'Paco Osuna', 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg', 'soundcloud', 'https://soundcloud.com/pacoosuna/minimalmonday', 'Stripped back minimal grooves to start your week', 'Minimal Techno', ARRAY['Minimal', 'Monday', 'Grooves'], 1123, 43210, false),

('Deep House Vibes', 'Solomun', 'https://images.pexels.com/photos/2147029/pexels-photo-2147029.jpeg', 'soundcloud', 'https://soundcloud.com/solomun/deepvibes', 'Deep, soulful house music for the soul', 'Deep House', ARRAY['Deep', 'Soulful', 'Vibes'], 3890, 145670, true),

('Acid Flashback', 'Amelie Lens', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', 'soundcloud', 'https://soundcloud.com/amelielens/acidflashback', 'Acid-infused techno from the Belgian queen', 'Acid Techno', ARRAY['Acid', 'Techno', 'Flashback'], 1678, 54320, false);