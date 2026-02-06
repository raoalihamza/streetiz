/*
  # Add More Editorial Posts

  1. Content Addition
    - Add 12 new editorial posts to populate the "Latest Articles" section
    - Posts cover various topics: music, culture, breaking, nightlife, events
    - All posts are marked as published with proper timestamps
  
  2. Categories Covered
    - Electronic music and DJ culture
    - Street dance and breaking
    - Club culture and nightlife
    - Urban art and street culture
    - Festival and event coverage
*/

INSERT INTO news (title, slug, content, excerpt, featured_image, status, featured, published_at)
VALUES
  (
    'Banksy Strikes Paris: New Mural Appears in Belleville',
    'banksy-strikes-paris-new-mural-belleville',
    'A stunning new piece attributed to the legendary street artist Banksy has appeared overnight in Paris'' vibrant Belleville district, drawing crowds of admirers and sparking debates about urban art and gentrification.',
    'Mysterious new Banksy mural appears in Belleville, featuring powerful imagery that speaks to urban transformation and community resilience.',
    'https://images.pexels.com/photos/2916814/pexels-photo-2916814.jpeg',
    'published',
    false,
    NOW() - INTERVAL '1 day'
  ),
  (
    'Nina Kraviz Announces 48-Hour Marathon Set in Moscow',
    'nina-kraviz-announces-48-hour-marathon-set',
    'Russian techno icon Nina Kraviz pushes boundaries with announcement of a historic 48-hour continuous DJ set at Moscow''s legendary Propaganda club, promising an unprecedented journey through electronic music history.',
    'Nina Kraviz prepares for groundbreaking 48-hour DJ marathon, promising to redefine the limits of electronic music performance.',
    'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg',
    'published',
    false,
    NOW() - INTERVAL '2 days'
  ),
  (
    'UK B-Boy Championships Return to London O2 Arena',
    'uk-b-boy-championships-return-london-o2',
    'The world''s most prestigious breaking competition returns to London with 32 crews from across the globe competing for the championship title. This year''s event features special appearances from original rock steady crew members.',
    'Breaking''s biggest championship returns to London with international crews battling for glory at the O2 Arena this November.',
    'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg',
    'published',
    false,
    NOW() - INTERVAL '3 days'
  ),
  (
    'Fabric London Unveils Room Four: New Space for Experimental Sound',
    'fabric-london-unveils-room-four-experimental',
    'Iconic London nightclub Fabric announces the opening of Room Four, a cutting-edge space dedicated to experimental electronic music, ambient soundscapes, and avant-garde performances.',
    'Fabric London expands with innovative Room Four, dedicated to pushing boundaries of experimental electronic music and immersive audio experiences.',
    'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg',
    'published',
    false,
    NOW() - INTERVAL '4 days'
  ),
  (
    'Tomorrowland Winter 2025: Tickets Sell Out in Record Time',
    'tomorrowland-winter-2025-tickets-sell-out',
    'Tomorrowland Winter 2025 breaks all previous records with tickets selling out in just 47 minutes. The festival promises the biggest lineup yet with exclusive alpine performances.',
    'Tomorrowland Winter 2025 tickets vanish in 47 minutes as festival announces biggest lineup in its alpine edition history.',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    'published',
    false,
    NOW() - INTERVAL '5 days'
  ),
  (
    'Brooklyn Street Art Festival: 100 Artists Transform Bushwick',
    'brooklyn-street-art-festival-bushwick-transformation',
    'Bushwick''s annual street art festival returns with 100 international artists creating massive murals across 50 buildings, transforming the neighborhood into an open-air gallery.',
    'Brooklyn''s Bushwick neighborhood becomes living canvas as 100 street artists from around world create transformative urban art installations.',
    'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
    'published',
    false,
    NOW() - INTERVAL '6 days'
  ),
  (
    'Amelie Lens Launches New Techno Label: LENSKE Records',
    'amelie-lens-launches-lenske-records',
    'Belgian techno powerhouse Amelie Lens announces the launch of LENSKE Records, her new imprint dedicated to discovering and promoting underground techno talent worldwide.',
    'Amelie Lens expands her techno empire with LENSKE Records, new label focused on nurturing next generation of underground talent.',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    'published',
    false,
    NOW() - INTERVAL '7 days'
  ),
  (
    'Red Bull Culture Clash Returns: Sound System Battle Royale',
    'red-bull-culture-clash-sound-system-battle',
    'The legendary sound system battle returns to Earls Court with four heavyweight crews competing in the ultimate clash of music cultures, featuring special guests and surprise performances.',
    'Sound system culture''s most explosive event returns as four crews battle for supremacy in Red Bull Culture Clash 2025.',
    'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg',
    'published',
    false,
    NOW() - INTERVAL '8 days'
  ),
  (
    'Graffiti Artist JR Covers NYC Buildings with Giant Portraits',
    'jr-artist-giant-portraits-nyc-buildings',
    'French artist JR transforms New York skyline with massive black and white portraits of everyday New Yorkers, creating powerful commentary on community and identity.',
    'JR''s latest project covers NYC buildings with towering portraits, celebrating the city''s diverse communities through monumental street art.',
    'https://images.pexels.com/photos/1183099/pexels-photo-1183099.jpeg',
    'published',
    false,
    NOW() - INTERVAL '9 days'
  ),
  (
    'Dixon Opens New Club Kater Blau Successor in Berlin',
    'dixon-opens-new-club-kater-blau-berlin',
    'Innervisions label boss Dixon unveils his latest venue project, a stunning waterfront space that promises to carry on the legacy of Berlin''s beloved Kater Blau.',
    'Dixon''s new Berlin club opens on Spree River, promising to become the new epicenter of the city''s legendary electronic music scene.',
    'https://images.pexels.com/photos/2034851/pexels-photo-2034851.jpeg',
    'published',
    false,
    NOW() - INTERVAL '10 days'
  ),
  (
    'Battle of the Year 2025: Korea Dominates Breaking World Stage',
    'battle-of-the-year-2025-korea-dominates',
    'South Korean crews sweep Battle of the Year 2025, taking home both crew and solo battle championships with innovative moves that redefine contemporary breaking.',
    'Korean breakers dominate Battle of the Year with revolutionary techniques, proving their continued supremacy in global breaking scene.',
    'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg',
    'published',
    false,
    NOW() - INTERVAL '11 days'
  ),
  (
    'Coachella 2025: Daft Punk Reunion Rumors Reach Fever Pitch',
    'coachella-2025-daft-punk-reunion-rumors',
    'Internet explodes with speculation as cryptic pyramid imagery appears on Coachella social media, fueling rumors of legendary French duo''s first performance in years.',
    'Daft Punk reunion speculation intensifies as mysterious Coachella teasers send electronic music community into frenzy of anticipation.',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    'published',
    false,
    NOW() - INTERVAL '12 days'
  );