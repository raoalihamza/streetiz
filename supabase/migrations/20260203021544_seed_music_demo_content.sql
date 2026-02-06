/*
  # Seed Demo Music Content

  1. Populate Tables
    - Insert demo tracks
    - Insert demo DJ sets
    - Insert demo releases
    - Insert demo articles
*/

-- Insert demo music tracks
INSERT INTO music_tracks (title, artist, cover_url, audio_url, genre, duration, plays, likes, buy_url, is_featured) VALUES
('Midnight Groove', 'DJ Laurent', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'House', 320, 15420, 892, 'https://www.beatport.com', true),
('Electric Dreams', 'Nina Berg', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Techno', 285, 12340, 765, 'https://www.beatport.com', false),
('Afro Vibes', 'Kofi Sound', 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'Afro House', 340, 18920, 1124, 'https://www.beatport.com', true),
('Neon Lights', 'The Synthesizers', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'Electro', 298, 9870, 543, 'https://www.beatport.com', false),
('Breakbeat Madness', 'Rhythm Kings', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'Breakbeat', 265, 7650, 421, 'https://www.beatport.com', false),
('Deep Into Night', 'Marcus Soul', 'https://images.pexels.com/photos/1449791/pexels-photo-1449791.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'House', 310, 14200, 812, 'https://www.beatport.com', false),
('Techno Warfare', 'Iron Beats', 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'Techno', 330, 16540, 945, 'https://www.beatport.com', true),
('Sunset Groove', 'Beach Collective', 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'House', 295, 11230, 678, 'https://www.beatport.com', false),
('African Spirit', 'Mama Afrika', 'https://images.pexels.com/photos/1916824/pexels-photo-1916824.jpeg?auto=compress&w=400', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'Afro House', 355, 20100, 1345, 'https://www.beatport.com', true);

-- Insert demo DJ sets
INSERT INTO music_dj_sets (title, artist, cover_url, video_url, description, genre, duration, plays, likes, is_live, event_location) VALUES
('Boiler Room Paris', 'DJ Snake', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'An incredible 2-hour set live from Paris featuring the best of house and techno.', 'House', 7200, 45230, 2134, true, 'Paris, France'),
('Warehouse Sessions', 'Charlotte de Witte', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Dark techno vibes from an underground warehouse in Berlin.', 'Techno', 5400, 38920, 1876, false, 'Berlin, Germany'),
('Afro House Live', 'Black Coffee', 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Smooth afro house rhythms captured live at Tomorrowland.', 'Afro House', 6000, 52340, 2567, true, 'Tomorrowland, Belgium'),
('Electro Night', 'Justice', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'High-energy electro set with massive basslines and synth work.', 'Electro', 4800, 29870, 1432, false, 'Montreal, Canada'),
('Breakbeat Special', 'The Chemical Brothers', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'A journey through breakbeat history with modern twists.', 'Breakbeat', 5100, 31200, 1654, false, 'London, UK'),
('Sunset Terrace Mix', 'Solomun', 'https://images.pexels.com/photos/1525041/pexels-photo-1525041.jpeg?auto=compress&w=800', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Melodic house from a sunset session on a rooftop terrace.', 'House', 6600, 41230, 2089, true, 'Ibiza, Spain');

-- Insert demo releases
INSERT INTO music_releases (title, artist, cover_url, audio_url, description, genre, label, release_date, buy_url, is_exclusive) VALUES
('Nocturnal EP', 'DJ Laurent', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&w=600', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'A four-track EP exploring the darker side of house music with hypnotic basslines and atmospheric pads.', 'House', 'Defected Records', '2026-01-15', 'https://www.beatport.com', true),
('Industrial Revolution', 'Nina Berg', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&w=600', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'Raw and powerful techno tracks inspired by industrial soundscapes.', 'Techno', 'Drumcode', '2026-01-20', 'https://www.beatport.com', false),
('Motherland Rhythms', 'Kofi Sound', 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&w=600', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'Traditional African percussion meets modern house production in this uplifting release.', 'Afro House', 'Seres Producoes', '2026-02-01', 'https://www.beatport.com', true),
('Neon Dreams', 'The Synthesizers', 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&w=600', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'Retro-futuristic electro with heavy synth work and punchy drums.', 'Electro', 'Ed Banger Records', '2026-01-25', 'https://www.beatport.com', false),
('Break The System', 'Rhythm Kings', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&w=600', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'High-octane breakbeat that pushes the boundaries of the genre.', 'Breakbeat', 'Hospital Records', '2026-02-10', 'https://www.beatport.com', true),
('Deep State', 'Marcus Soul', 'https://images.pexels.com/photos/1449791/pexels-photo-1449791.jpeg?auto=compress&w=600', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'Deep house grooves perfect for late-night sessions on the dancefloor.', 'House', 'Crosstown Rebels', '2026-01-18', 'https://www.beatport.com', false);

-- Insert demo music articles
INSERT INTO music_articles (title, content, cover_url, artist, genre, audio_url, is_featured) VALUES
('The Rise of Afro House', 'Afro house has become one of the most exciting and rapidly growing genres in electronic music. Combining traditional African percussion with modern house production techniques, artists like Black Coffee and Kofi Sound are bringing new energy to dancefloors worldwide.', 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&w=800', 'Various Artists', 'Afro House', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', true),
('Techno''s Dark Renaissance', 'The underground techno scene is experiencing a renaissance, with artists pushing the boundaries of sound design and exploring darker, more industrial territories. From Berlin to Detroit, a new generation is redefining what techno can be.', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&w=800', 'Various Artists', 'Techno', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', true),
('Breakbeat: From Jungle to Now', 'Breakbeat has evolved from its jungle and drum & bass roots into a diverse genre spanning multiple tempos and styles. Modern producers are rediscovering the energy and creativity that made breakbeat so influential.', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&w=800', 'Various Artists', 'Breakbeat', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', false);