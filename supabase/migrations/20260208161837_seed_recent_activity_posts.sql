/*
  # Generate Recent Activity Posts

  1. Purpose
    - Creates recent posts from various users to populate the activity feed
    - Includes diverse post types: text, photos, videos, audio
    - All posts are timestamped within the last 24 hours for fresh content
  
  2. New Data
    - Multiple posts from different users
    - Various post types (text, photo, video, audio)
    - Recent timestamps for activity feed
  
  3. Content Types
    - Text posts with urban/street culture themes
    - Photo posts with event photos
    - YouTube video shares
    - Audio track shares
*/

-- Insert recent text posts
INSERT INTO posts (user_id, post_type, content, likes_count, comments_count, created_at)
VALUES
  -- Stella posting about tonight
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    'text',
    'Soirée incroyable ce soir au Warehouse 🔥 Qui vient ?',
    23,
    7,
    NOW() - INTERVAL '2 hours'
  ),
  -- Thunder promoting an event
  (
    '295caf8d-daad-479e-9ca8-39a5f975ec23',
    'text',
    'Notre plus gros event de l''année approche ! 🎉 Line-up de fou, restez connectés...',
    156,
    34,
    NOW() - INTERVAL '5 hours'
  ),
  -- Blaze sharing vibes
  (
    '105d3021-8d6b-480b-8205-b32d8e709bf2',
    'text',
    'Le set de samedi dernier était légendaire 🎧 Merci à tous ceux qui sont venus danser !',
    89,
    12,
    NOW() - INTERVAL '8 hours'
  ),
  -- Mia Vibes looking for collabs
  (
    '0416d585-d257-4ef6-922f-7db55841d9d7',
    'text',
    'Cherche des artistes pour une collab sur un nouveau projet deep house 🎵 DM open',
    45,
    18,
    NOW() - INTERVAL '3 hours'
  ),
  -- Kosmo sharing news
  (
    'f9cbe6ed-f295-4221-ab81-75f4db718ea0',
    'text',
    'Nouveau mix disponible sur SoundCloud ! 90 minutes de pure techno 🖤',
    67,
    9,
    NOW() - INTERVAL '6 hours'
  ),
  -- Lumy about tonight
  (
    '5b63fb0d-620a-4321-bca2-fd01bcdeccce',
    'text',
    'Libre ce soir, qui est dispo pour sortir ? 🌃',
    34,
    21,
    NOW() - INTERVAL '1 hour'
  ),
  -- Technova sharing inspiration
  (
    'da665350-e017-4264-b1fc-9db3c6187fbb',
    'text',
    'La scène underground de cette ville est incroyable. Tellement de talents cachés 💎',
    78,
    15,
    NOW() - INTERVAL '4 hours'
  ),
  -- VJ Amber about visuals
  (
    '35b48dbc-3e38-4085-afed-838a78e6e9bb',
    'text',
    'Travail sur de nouvelles visuels pour le prochain show. Ça va être épique 👁️✨',
    92,
    11,
    NOW() - INTERVAL '7 hours'
  ),
  -- Lexa Motion about production
  (
    '78a9ab79-c87f-46d9-9833-ba7283c86f90',
    'text',
    'Studio session toute la journée. Nouveau track presque terminé 🎹🔊',
    61,
    8,
    NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT DO NOTHING;

-- Insert recent photo posts
INSERT INTO posts (user_id, post_type, content, media_urls, likes_count, comments_count, created_at)
VALUES
  -- Stella with event photos
  (
    '62c3c535-cf4d-4b8e-b590-45e70d106578',
    'photo',
    'Quelques moments de la soirée d''hier ✨',
    ARRAY[
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    234,
    42,
    NOW() - INTERVAL '10 hours'
  ),
  -- Thunder with club night
  (
    '295caf8d-daad-479e-9ca8-39a5f975ec23',
    'photo',
    'Ambiance de folie samedi ! 🔥',
    ARRAY[
      'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/2114365/pexels-photo-2114365.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    312,
    56,
    NOW() - INTERVAL '12 hours'
  ),
  -- Blaze behind the decks
  (
    '105d3021-8d6b-480b-8205-b32d8e709bf2',
    'photo',
    'Behind the decks 🎧',
    ARRAY['https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800'],
    187,
    28,
    NOW() - INTERVAL '9 hours'
  )
ON CONFLICT DO NOTHING;

-- Insert YouTube video posts
INSERT INTO posts (user_id, post_type, content, youtube_url, likes_count, comments_count, created_at)
VALUES
  -- Kosmo sharing a DJ set
  (
    'f9cbe6ed-f295-4221-ab81-75f4db718ea0',
    'video',
    'Mon dernier set complet est dispo ! 2 heures de techno 🎵',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    145,
    23,
    NOW() - INTERVAL '15 hours'
  ),
  -- VJ Amber sharing visuals
  (
    '35b48dbc-3e38-4085-afed-838a78e6e9bb',
    'video',
    'Compilation de mes meilleurs visuels de l''année 👁️',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    203,
    31,
    NOW() - INTERVAL '11 hours'
  )
ON CONFLICT DO NOTHING;

-- Insert audio posts
INSERT INTO posts (user_id, post_type, content, audio_title, audio_artist, audio_url, audio_cover_url, likes_count, comments_count, created_at)
VALUES
  -- Mia Vibes with new track
  (
    '0416d585-d257-4ef6-922f-7db55841d9d7',
    'audio',
    'Ma nouvelle production est enfin sortie ! 🎵',
    'Deep Midnight',
    'Mia Vibes',
    'https://example.com/audio/deep-midnight.mp3',
    'https://images.pexels.com/photos/210854/pexels-photo-210854.jpeg?auto=compress&cs=tinysrgb&w=400',
    178,
    35,
    NOW() - INTERVAL '14 hours'
  ),
  -- Lexa Motion sharing remix
  (
    '78a9ab79-c87f-46d9-9833-ba7283c86f90',
    'audio',
    'Remix terminé ! Qu''en pensez-vous ? 🔊',
    'Urban Echoes (Lexa Remix)',
    'Lexa Motion',
    'https://example.com/audio/urban-echoes.mp3',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
    124,
    19,
    NOW() - INTERVAL '13 hours'
  )
ON CONFLICT DO NOTHING;

-- Add some posts from the main Streetiz account
INSERT INTO posts (user_id, post_type, content, likes_count, comments_count, created_at)
VALUES
  (
    '4684c14f-e33c-4ec4-8a0a-66c254ab9d9f',
    'text',
    'La communauté Streetiz grandit chaque jour ! Merci à tous pour votre énergie 🙌',
    342,
    67,
    NOW() - INTERVAL '20 hours'
  ),
  (
    '4684c14f-e33c-4ec4-8a0a-66c254ab9d9f',
    'text',
    'N''oubliez pas de mettre à jour vos agendas avec vos prochaines sorties ! 📅',
    98,
    12,
    NOW() - INTERVAL '16 hours'
  )
ON CONFLICT DO NOTHING;
