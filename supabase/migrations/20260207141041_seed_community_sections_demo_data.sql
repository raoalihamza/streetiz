/*
  # Seed Community Sections Demo Data

  1. Forum Topics
    - 8 demo topics covering various categories (Electro, DJing, Events, Matériel, Danse)
    - Each with realistic content and photos
    
  2. Forum Replies/Comments
    - Multiple replies for each topic to simulate engagement
    
  3. Marketplace Items
    - 12 demo items covering DJ, Vidéo, Enceintes, Accessoires, Lumières
    - Realistic prices and locations in Paris area
    
  4. Castings & Jobs
    - 6 demo castings for DJ, dancers, video, staff
    - Realistic dates, fees, and locations
*/

-- Get sample user IDs
DO $$
DECLARE
  user1_id uuid;
  user2_id uuid;
  user3_id uuid;
  user4_id uuid;
BEGIN
  -- Get some existing user IDs from profiles
  SELECT id INTO user1_id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 0;
  SELECT id INTO user2_id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO user3_id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 2;
  SELECT id INTO user4_id FROM profiles ORDER BY created_at LIMIT 1 OFFSET 3;

  -- If we don't have enough users, use the first one for all
  IF user2_id IS NULL THEN user2_id := user1_id; END IF;
  IF user3_id IS NULL THEN user3_id := user1_id; END IF;
  IF user4_id IS NULL THEN user4_id := user1_id; END IF;

  -- Insert Forum Topics
  INSERT INTO forum_topics (user_id, title, category, content, photos, views_count, replies_count, is_resolved)
  VALUES
    (
      user1_id,
      'Quel contrôleur DJ pour débuter en Electro ?',
      'Matériel',
      'Salut la communauté ! Je veux me lancer dans le DJing électro et j''ai un budget d''environ 400-500€. J''hésite entre le Pioneer DDJ-400 et le Traktor S2. Des avis ? Merci !',
      ARRAY[
        'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
        'https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg'
      ],
      134,
      8,
      true
    ),
    (
      user2_id,
      'Meilleur spot à Paris pour shooter des vidéos danse ?',
      'Danse',
      'Je cherche des lieux sympas dans Paris pour tourner des vidéos de danse électro. Des spots avec une bonne lumière naturelle et pas trop de monde ? J''ai pensé au Trocadéro mais c''est blindé...',
      ARRAY[
        'https://images.pexels.com/photos/3889827/pexels-photo-3889827.jpeg'
      ],
      89,
      12,
      false
    ),
    (
      user3_id,
      'Recherche crew électro pour un projet vidéo Streetiz',
      'Events',
      'Yo ! Je monte un projet vidéo danse électro dans le style Streetiz. Besoin de danseurs motivés niveau intermédiaire/avancé sur Paris. Tournage prévu fin mars. Intéressés ?',
      ARRAY[
        'https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg',
        'https://images.pexels.com/photos/1701194/pexels-photo-1701194.jpeg'
      ],
      156,
      15,
      false
    ),
    (
      user1_id,
      'Bons plans enceintes pour répètes ?',
      'Matériel',
      'Salut ! Je cherche des enceintes portables pour les répètes de danse. Budget max 300€. Besoin d''un bon son bass et assez puissant pour une salle de 50m². Des recommandations ?',
      ARRAY['https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'],
      67,
      6,
      false
    ),
    (
      user4_id,
      'Transition vinyl → digital, vos conseils ?',
      'DJing',
      'Après 10 ans de vinyl, je passe au digital. C''est difficile mentalement haha ! Vous utilisez quoi comme setup ? CDJ ou contrôleur ? Et comment vous gérez la nostalgie du vinyle ?',
      ARRAY[
        'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'
      ],
      201,
      19,
      false
    ),
    (
      user2_id,
      'Battle electro dance - règles et tips ?',
      'Danse',
      'Premier battle électro dans 2 semaines, un peu stressé ! Des conseils sur la préparation, le mental, la musicalité ? Comment vous gérez le stress avant de monter sur scène ?',
      ARRAY[
        'https://images.pexels.com/photos/1566948/pexels-photo-1566948.jpeg',
        'https://images.pexels.com/photos/3775121/pexels-photo-3775121.jpeg'
      ],
      178,
      23,
      false
    ),
    (
      user3_id,
      'Organisation event électro - checklist complète ?',
      'Events',
      'Je prépare mon premier event électro (150 personnes). Quelqu''un aurait une checklist complète ? Niveau sono, lumières, promo, sécurité, etc. Tous les tips sont bons à prendre !',
      ARRAY['https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'],
      145,
      17,
      false
    ),
    (
      user1_id,
      'Meilleurs logiciels de montage pour vidéos danse ?',
      'Electro',
      'Je veux me lancer dans le montage de mes vidéos de danse. Entre Premiere Pro, Final Cut, et DaVinci Resolve, vous me conseillez quoi pour débuter ? Besoin d''effets style ralenti et color grading.',
      ARRAY[
        'https://images.pexels.com/photos/5864245/pexels-photo-5864245.jpeg'
      ],
      112,
      14,
      false
    );

  -- Insert Forum Replies for the first topic
  INSERT INTO forum_replies (topic_id, user_id, content)
  SELECT 
    (SELECT id FROM forum_topics WHERE title = 'Quel contrôleur DJ pour débuter en Electro ?' LIMIT 1),
    user2_id,
    'DDJ-400 sans hésiter ! Super pour débuter, compatible Rekordbox, et tu peux le revendre facilement si tu upgrades plus tard.'
  WHERE EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Quel contrôleur DJ pour débuter en Electro ?');

  INSERT INTO forum_replies (topic_id, user_id, content)
  SELECT 
    (SELECT id FROM forum_topics WHERE title = 'Quel contrôleur DJ pour débuter en Electro ?' LIMIT 1),
    user3_id,
    'Perso j''ai le Traktor S2 et j''adore ! La qualité de construction est top et le logiciel Traktor est hyper intuitif.'
  WHERE EXISTS (SELECT 1 FROM forum_topics WHERE title = 'Quel contrôleur DJ pour débuter en Electro ?');

  -- Insert Marketplace Items
  INSERT INTO marketplace_items (seller_id, title, description, category, listing_type, price, condition, location, images, status)
  VALUES
    (
      user1_id,
      'Platines Pioneer XDJ-RX2',
      'Vends mes XDJ-RX2 en excellent état, très peu servi (uniquement en home studio). Système tout-en-un parfait pour les DJ confirmés. Vendu avec housse de protection. Possibilité de test sur place.',
      'dj_gear',
      'sale',
      950.00,
      'good',
      'Paris 10e',
      ARRAY[
        'https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg',
        'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
      ],
      'available'
    ),
    (
      user2_id,
      'Sony A7III + objectif 28-70mm',
      'Vends mon Sony A7III avec objectif kit 28-70mm. Parfait état, environ 15000 déclenchements. Idéal pour la vidéo danse et events. Batteries supplémentaires incluses.',
      'video',
      'sale',
      750.00,
      'good',
      'Saint-Ouen',
      ARRAY[
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'
      ],
      'available'
    ),
    (
      user3_id,
      'Enceintes KRK Rokit 5 (la paire)',
      'Paire d''enceintes de monitoring KRK Rokit 5 G4. Parfait état, son excellent pour la prod et le mix. Vente car upgrade vers des 8 pouces. Câbles XLR inclus.',
      'audio',
      'sale',
      180.00,
      'good',
      'Montreuil',
      ARRAY[
        'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'
      ],
      'available'
    ),
    (
      user4_id,
      'Ring Light 45cm avec trépied',
      'Ring light LED 45cm avec trépied extensible jusqu''à 2m. Parfait pour les vidéos danse et portraits. 3 modes d''éclairage, intensité réglable. Télécommande bluetooth incluse.',
      'accessories',
      'sale',
      25.00,
      'used',
      'Paris 19e',
      ARRAY[
        'https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg'
      ],
      'available'
    ),
    (
      user1_id,
      'Machine à fumée Chauvet Hurricane',
      'Machine à fumée Chauvet Hurricane 1600. Fonctionne parfaitement, idéale pour events et vidéos. Télécommande filaire incluse. Possibilité de fournir 1L de liquide avec.',
      'lighting',
      'sale',
      90.00,
      'good',
      'Ivry-sur-Seine',
      ARRAY[
        'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'
      ],
      'available'
    ),
    (
      user2_id,
      'Casque Sennheiser HD 25',
      'Le casque de DJ légendaire ! État impeccable, coussinets neufs changés il y a 2 mois. Son parfait, isolation excellente. Câble de rechange inclus.',
      'dj_gear',
      'sale',
      110.00,
      'good',
      'Paris 11e',
      ARRAY[
        'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
      ],
      'available'
    ),
    (
      user3_id,
      'Stabilisateur DJI Ronin SC',
      'Gimbal DJI Ronin SC pour caméras jusqu''à 2kg. Parfait pour des vidéos fluides de danse et events. Très bon état, mallette de transport incluse.',
      'video',
      'sale',
      280.00,
      'good',
      'Pantin',
      ARRAY[
        'https://images.pexels.com/photos/133836/pexels-photo-133836.jpeg'
      ],
      'available'
    ),
    (
      user4_id,
      'Enceinte JBL Partybox 310',
      'Enceinte portable JBL Partybox 310. Son énorme, effets lumineux intégrés. Parfaite pour répètes, battles, ou petits events. Batterie 18h d''autonomie.',
      'audio',
      'sale',
      320.00,
      'good',
      'Clichy',
      ARRAY[
        'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
      ],
      'available'
    ),
    (
      user1_id,
      'Projecteur LED PAR 64',
      'Lot de 4 projecteurs LED PAR 64 RGB. Contrôle DMX, programmes auto, télécommande. Parfait pour éclairer un petit événement ou studio. Câbles DMX inclus.',
      'lighting',
      'sale',
      150.00,
      'good',
      'Paris 18e',
      ARRAY[
        'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
      ],
      'available'
    ),
    (
      user2_id,
      'Table de mixage Allen & Heath Xone:23',
      'Mixeur 2+2 voies Allen & Heath Xone:23. Son de qualité, filtres excellents. Parfait pour le mix vinyl ou digital. Quelques traces d''usage mais fonctionne parfaitement.',
      'dj_gear',
      'sale',
      380.00,
      'used',
      'Bagnolet',
      ARRAY[
        'https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg'
      ],
      'available'
    ),
    (
      user3_id,
      'GoPro Hero 10 + accessoires',
      'GoPro Hero 10 avec batterie supplémentaire, carte SD 128GB, et divers supports. Idéal pour POV danse et events. Excellent état.',
      'video',
      'sale',
      280.00,
      'good',
      'Paris 20e',
      ARRAY[
        'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'
      ],
      'available'
    ),
    (
      user4_id,
      'Pack câbles XLR/Jack professionnel',
      'Lot de 6 câbles XLR (3m et 5m) + 4 câbles Jack 6.35mm. Parfait pour monter un home studio ou sonoriser un event. Tous testés et fonctionnels.',
      'accessories',
      'sale',
      45.00,
      'used',
      'Aubervilliers',
      ARRAY[
        'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'
      ],
      'available'
    );

  -- Insert Castings & Jobs
  INSERT INTO castings_jobs (user_id, title, description, type, event_date, fee, location, contact_info, photos, status)
  VALUES
    (
      user1_id,
      'Casting Electro Danse – Clip House Music',
      'Recherche 4 danseurs électro (H/F) pour un tournage de clip house music. Le tournage aura lieu dans un entrepôt urbain à Paris 13. Niveau intermédiaire/avancé requis. Ambiance crew, bonne énergie garantie !',
      'Danseur',
      '2026-03-21',
      'Cachet : 120€',
      'Paris 13e',
      'Contact : castingstreetiz@gmail.com',
      ARRAY[
        'https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg',
        'https://images.pexels.com/photos/3889827/pexels-photo-3889827.jpeg'
      ],
      'open'
    ),
    (
      user2_id,
      'Booking DJ Electro / Techno – Club République',
      'Club à République cherche DJ pour soirée électro/techno le 15 février. Set d''1h30. Public habitué, bonne sono. Défrayé + consommations. Envoie ta démo !',
      'DJ',
      '2026-02-15',
      'Défrayé + consommations',
      'Paris 3e – République',
      'Contact MP ou booking@clubrepublique.fr',
      ARRAY[
        'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
      ],
      'open'
    ),
    (
      user3_id,
      'Recherche cadreur – Battle Streetiz',
      'On organise une battle électro à Saint-Ouen le samedi 17 février. Besoin d''un cadreur pour filmer l''event (multi-cam si possible). Petite rémunération + accès VIP.',
      'Vidéo',
      '2026-02-17',
      'Rémunération + accès VIP',
      'Saint-Ouen',
      'DM ou streetizbattle@gmail.com',
      ARRAY[
        'https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg'
      ],
      'open'
    ),
    (
      user4_id,
      'Workshop Electro Dance – Débutants bienvenus',
      'Atelier danse électro tous niveaux le dimanche 25 février. On travaillera les bases : bounce, popping, waving. 2h d''atelier + freestyle session. 15€ l''atelier.',
      'Workshop',
      '2026-02-25',
      '15€ par participant',
      'Montreuil – Salle de danse',
      'Inscription : workshopelectro@gmail.com',
      ARRAY[
        'https://images.pexels.com/photos/3775121/pexels-photo-3775121.jpeg',
        'https://images.pexels.com/photos/1566948/pexels-photo-1566948.jpeg'
      ],
      'open'
    ),
    (
      user1_id,
      'Staff Event – Soirée Electro 300 personnes',
      'Cherche 3 personnes pour le staff d''une soirée électro le 8 mars (vestiaire, bar, accueil). Ambiance cool, équipe sympa. Payé 12€/h, soirée de 21h à 4h.',
      'Staff',
      '2026-03-08',
      '12€/h (21h-4h)',
      'Paris 19e – Glazart',
      'CV à : staffeventparis@gmail.com',
      ARRAY[
        'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'
      ],
      'open'
    ),
    (
      user2_id,
      'Figuration clip électro – Ambiance warehouse',
      'Recherche 10-15 personnes pour figuration dans un clip électro. Tournage dans un hangar à Pantin le 12 mars. Look urbain/streetwear. Défrayé + repas + copie du clip.',
      'Figuration',
      '2026-03-12',
      'Défrayé + repas',
      'Pantin',
      'Inscription : figurationclip@gmail.com',
      ARRAY[
        'https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg'
      ],
      'open'
    );

END $$;