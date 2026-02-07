/*
  # Seed Download and Purchase Links Examples

  1. Updates
    - Add free download links to some tracks
    - Add Beatport purchase links to some tracks
    - Add Bandcamp purchase links to some tracks

  2. Purpose
    - Provide examples of different link types
    - Test the display of download and purchase buttons
*/

-- Update some existing posts with download/purchase links
UPDATE music_video_posts
SET 
  download_url = 'https://soundcloud.com/artist/track/download',
  genre = 'Free Download'
WHERE id IN (
  SELECT id FROM music_video_posts
  WHERE title LIKE '%Mixtape%' OR title LIKE '%Mix%'
  LIMIT 2
);

UPDATE music_video_posts
SET 
  purchase_url = 'https://www.beatport.com/track/example',
  purchase_platform = 'beatport'
WHERE id IN (
  SELECT id FROM music_video_posts
  WHERE content_type = 'soundcloud' AND download_url IS NULL
  LIMIT 3
);

UPDATE music_video_posts
SET 
  purchase_url = 'https://artist.bandcamp.com/track/example',
  purchase_platform = 'bandcamp'
WHERE id IN (
  SELECT id FROM music_video_posts
  WHERE content_type = 'youtube' AND download_url IS NULL
  LIMIT 2
);
