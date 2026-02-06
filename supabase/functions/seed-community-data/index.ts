import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface FakeUser {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  country: string;
  profile_role: string;
  followers_count: number;
  following_count: number;
  online_status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: currentUser } } = await supabaseClient.auth.getUser(token);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fakeUsers: FakeUser[] = [
      { username: 'djrylex', display_name: 'DJ RYLEX', bio: 'House & Techno DJ from Paris. Resident at Rex Club.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'Paris', country: 'France', profile_role: 'dj', followers_count: 42000, following_count: 890, online_status: 'online' },
      { username: 'miavibes', display_name: 'MIA VIBES', bio: 'Electro dancer & choreographer. Let\'s move!', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Brussels', country: 'Belgium', profile_role: 'dancer', followers_count: 18000, following_count: 645, online_status: 'offline' },
      { username: 'kosmo_creator', display_name: 'KOSMO', bio: 'Content creator specializing in electronic music culture.', avatar_url: 'https://images.pexels.com/photos/1708506/pexels-photo-1708506.jpeg', location: 'Madrid', country: 'Spain', profile_role: 'creator', followers_count: 27000, following_count: 520, online_status: 'online' },
      { username: 'lumy_dance', display_name: 'LUMY', bio: 'Berlin-based dancer. Electro & House styles.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Berlin', country: 'Germany', profile_role: 'dancer', followers_count: 56000, following_count: 1200, online_status: 'online' },
      { username: 'technovanl', display_name: 'TECHNOVA', bio: 'Underground techno selector. Amsterdam nights.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'Amsterdam', country: 'Netherlands', profile_role: 'dj', followers_count: 88000, following_count: 2100, online_status: 'offline' },
      { username: 'vjamber', display_name: 'VJ AMBER', bio: 'Visual artist & videographer for live events.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Marseille', country: 'France', profile_role: 'videographer', followers_count: 12000, following_count: 380, online_status: 'online' },
      { username: 'lexamotion', display_name: 'LEXA MOTION', bio: 'Electro dance instructor. Workshops across Europe.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Rome', country: 'Italy', profile_role: 'dancer', followers_count: 9000, following_count: 290, online_status: 'away' },
      { username: 'djnova', display_name: 'DJ NOVA', bio: 'Drum & Bass specialist. UK vibes worldwide.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'London', country: 'UK', profile_role: 'dj', followers_count: 65000, following_count: 1450, online_status: 'online' },
      { username: 'zephyr_beats', display_name: 'ZEPHYR', bio: 'Producer & DJ. Future House & Bass.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'Barcelona', country: 'Spain', profile_role: 'dj', followers_count: 34000, following_count: 780, online_status: 'offline' },
      { username: 'luna_lights', display_name: 'LUNA', bio: 'Lighting designer for festivals & clubs.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Lyon', country: 'France', profile_role: 'organizer', followers_count: 15000, following_count: 410, online_status: 'online' },
      { username: 'kraken_dj', display_name: 'KRAKEN', bio: 'Dark techno & industrial sounds.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'Vienna', country: 'Austria', profile_role: 'dj', followers_count: 23000, following_count: 560, online_status: 'offline' },
      { username: 'phoenix_flow', display_name: 'PHOENIX', bio: 'Breakdancer & choreographer.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Copenhagen', country: 'Denmark', profile_role: 'dancer', followers_count: 19000, following_count: 490, online_status: 'online' },
      { username: 'axel_frames', display_name: 'AXEL', bio: 'Event photographer capturing the energy.', avatar_url: 'https://images.pexels.com/photos/1708506/pexels-photo-1708506.jpeg', location: 'Lisbon', country: 'Portugal', profile_role: 'photographer', followers_count: 31000, following_count: 720, online_status: 'offline' },
      { username: 'maya_moves', display_name: 'MAYA', bio: 'Popping & locking specialist.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Milan', country: 'Italy', profile_role: 'dancer', followers_count: 14000, following_count: 370, online_status: 'away' },
      { username: 'voltix_sound', display_name: 'VOLTIX', bio: 'Sound engineer & DJ. Perfect mix guaranteed.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'Munich', country: 'Germany', profile_role: 'dj', followers_count: 28000, following_count: 650, online_status: 'online' },
      { username: 'neo_visuals', display_name: 'NEO', bio: 'VJ & motion designer for live shows.', avatar_url: 'https://images.pexels.com/photos/1708506/pexels-photo-1708506.jpeg', location: 'Brussels', country: 'Belgium', profile_role: 'videographer', followers_count: 17000, following_count: 440, online_status: 'online' },
      { username: 'stella_spin', display_name: 'STELLA', bio: 'Vinyl collector & selector. Old school vibes.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Prague', country: 'Czech Republic', profile_role: 'dj', followers_count: 21000, following_count: 510, online_status: 'offline' },
      { username: 'thunder_events', display_name: 'THUNDER', bio: 'Event organizer. Making nights unforgettable.', avatar_url: 'https://images.pexels.com/photos/1708506/pexels-photo-1708506.jpeg', location: 'Zurich', country: 'Switzerland', profile_role: 'organizer', followers_count: 45000, following_count: 980, online_status: 'online' },
      { username: 'blaze_rhythm', display_name: 'BLAZE', bio: 'Hip-hop & electro fusion dancer.', avatar_url: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', location: 'Stockholm', country: 'Sweden', profile_role: 'dancer', followers_count: 13000, following_count: 350, online_status: 'away' },
      { username: 'echo_bass', display_name: 'ECHO', bio: 'Bass music producer & DJ.', avatar_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', location: 'Hamburg', country: 'Germany', profile_role: 'dj', followers_count: 26000, following_count: 620, online_status: 'online' },
    ];

    const userIds: string[] = [];

    for (const fakeUser of fakeUsers) {
      const email = `${fakeUser.username}@streetiz.test`;
      const password = 'Streetiz2026!';

      let userId: string | null = null;

      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUser?.users?.find(u => u.email === email);

      if (existing) {
        userId = existing.id;
        userIds.push(userId);
      } else {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (authError) {
          console.error(`Error creating user ${fakeUser.username}:`, authError);
          continue;
        }

        if (!authData.user) continue;

        userId = authData.user.id;
        userIds.push(userId);
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          username: fakeUser.username,
          display_name: fakeUser.display_name,
          bio: fakeUser.bio,
          avatar_url: fakeUser.avatar_url,
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error(`Error updating profile for ${fakeUser.username}:`, profileError);
      }

      const { error: extensionError } = await supabaseAdmin
        .from('profile_extensions')
        .upsert({
          id: userId,
          location: fakeUser.location,
          country: fakeUser.country,
          profile_role: fakeUser.profile_role,
          followers_count: fakeUser.followers_count,
          following_count: fakeUser.following_count,
          online_status: fakeUser.online_status,
        }, {
          onConflict: 'id'
        });

      if (extensionError) {
        console.error(`Error creating profile extension for ${fakeUser.username}:`, extensionError);
      }
    }

    if (userIds.length < 5) {
      throw new Error(`Not enough users created/found to seed announcements and marketplace. Only found ${userIds.length} users.`);
    }

    const announcements = [
      { user_id: userIds[0], type: 'festival', title: 'Cherche un +1 pour EWAVES Festival 2026', description: 'Je cherche quelqu\'un pour partager le trajet + entrée. Festival techno 3 jours en Allemagne. Ambiance garantie!', location: 'Berlin, Germany', event_date: '2026-07-16', tags: ['festival', 'techno', 'plus1'] },
      { user_id: userIds[2], type: 'concert', title: '2 places pour Carl Cox @ Fabric London', description: 'J\'ai 2 places pour le set de Carl Cox le mois prochain. Je peux plus y aller, prix négociable.', location: 'London, UK', event_date: '2026-03-22', tags: ['techno', 'london', 'vente'] },
      { user_id: userIds[4], type: 'festival', title: 'Tomorrowland 2026 - Cherche groupe', description: 'Looking for a crew to share the Tomorrowland experience! J\'ai déjà mon pass, cherche des gens cool.', location: 'Boom, Belgium', event_date: '2026-07-24', tags: ['tomorrowland', 'festival', 'group'] },
      { user_id: userIds[7], type: 'concert', title: 'Place gratuite Amelie Lens @ Awakenings', description: 'Un ami ne peut plus venir. Place gratuite pour Amelie Lens ce weekend.', location: 'Amsterdam, Netherlands', event_date: '2026-02-20', tags: ['techno', 'gratuit', 'amelielens'] },
      { user_id: userIds[1], type: 'carpooling', title: 'Covoiturage Paris → Lyon pour battle Electro', description: 'Départ samedi 9h du matin. 3 places disponibles. Partage des frais d\'essence. Retour dimanche soir.', location: 'Paris, France', event_date: '2026-02-25', tags: ['covoiturage', 'battle', 'electro'] },
      { user_id: userIds[3], type: 'carpooling', title: 'Trajet Berlin → Prague pour rave', description: 'Road trip vers Prague pour un gros event. 2 places dispo. Départ vendredi après-midi.', location: 'Berlin, Germany', event_date: '2026-03-15', tags: ['roadtrip', 'rave', 'prague'] },
      { user_id: userIds[5], type: 'carpooling', title: 'Marseille → Barcelona - Festival Sónar', description: 'Cherche 2-3 personnes pour partager le trajet et l\'hébergement. Budget friendly!', location: 'Marseille, France', event_date: '2026-06-18', tags: ['sonar', 'barcelona', 'festival'] },
      { user_id: userIds[9], type: 'carpooling', title: 'Lyon → Genève après-ski rave party', description: 'Aller-retour dans la journée. Place pour 2 personnes. Let\'s go!', location: 'Lyon, France', event_date: '2026-02-28', tags: ['geneva', 'party', 'alpes'] },
      { user_id: userIds[6], type: 'workshop', title: 'Workshop Electro Dance avec LEXA MOTION', description: 'Cours de danse electro tous niveaux. Samedi 14h-17h. 25€ par personne. Places limitées à 20.', location: 'Rome, Italy', event_date: '2026-03-08', tags: ['workshop', 'dance', 'electro'] },
      { user_id: userIds[11], type: 'workshop', title: 'Breaking & Popping masterclass', description: 'Intensive workshop de breakdance. Niveau intermédiaire à avancé. Inscription obligatoire.', location: 'Copenhagen, Denmark', event_date: '2026-03-12', tags: ['breaking', 'popping', 'workshop'] },
      { user_id: userIds[13], type: 'workshop', title: 'Stage chorégraphie House Dance', description: 'Week-end complet de house dance avec battles et showcases. 80€ les 2 jours.', location: 'Milan, Italy', event_date: '2026-04-05', tags: ['house', 'dance', 'stage'] },
      { user_id: userIds[18], type: 'workshop', title: 'Hip-hop meets Electro fusion class', description: 'Nouvelle approche de la danse urbaine mélangée à l\'electro. Tous niveaux bienvenus!', location: 'Stockholm, Sweden', event_date: '2026-02-26', tags: ['hiphop', 'electro', 'fusion'] },
      { user_id: userIds[0], type: 'workshop', title: 'Initiation DJing pour débutants', description: 'Apprends les bases du DJing : beatmatching, transitions, lecture de la foule. 4h intensive.', location: 'Paris, France', event_date: '2026-03-18', tags: ['dj', 'debutant', 'cours'] },
      { user_id: userIds[8], type: 'plus_one', title: 'Besoin d\'un wingman pour soirée à Berghain', description: 'J\'ai une entrée confirmée mais je préfère pas y aller seul. Cherche quelqu\'un qui connaît la techno.', location: 'Berlin, Germany', event_date: '2026-02-22', tags: ['berghain', 'techno', 'berlin'] },
      { user_id: userIds[10], type: 'plus_one', title: '+1 pour afterparty privée Vienne', description: 'Afterparty exclusive après un gros event. Cherche une personne open-minded.', location: 'Vienna, Austria', event_date: '2026-03-02', tags: ['after', 'private', 'vienna'] },
      { user_id: userIds[12], type: 'plus_one', title: 'Shooting photo festival - besoin assistant', description: 'Je couvre un festival et j\'ai besoin d\'un assistant photo. Accès VIP + crédits photos.', location: 'Lisbon, Portugal', event_date: '2026-05-10', tags: ['photo', 'festival', 'assistant'] },
      { user_id: userIds[14], type: 'other', title: 'Location platines Pioneer CDJ-3000 + DJM-A9', description: 'Matos pro en parfait état. Location à la journée ou au weekend. Caution demandée.', location: 'Munich, Germany', event_date: '2026-02-24', tags: ['pioneer', 'cdj', 'location'] },
      { user_id: userIds[15], type: 'other', title: 'Prête matos vidéo pour capturer ton event', description: 'Caméras, stabilisateurs, éclairage. Location avec possibilité de formation rapide.', location: 'Brussels, Belgium', event_date: '2026-03-01', tags: ['video', 'camera', 'location'] },
      { user_id: userIds[16], type: 'other', title: 'Recherche DJs pour compilation vinyl', description: 'Je prépare une compil vinyl. Cherche producteurs house/techno pour soumettre tracks.', location: 'Prague, Czech Republic', event_date: '2026-03-15', tags: ['vinyl', 'production', 'collab'] },
      { user_id: userIds[17], type: 'other', title: 'Cherche danseurs pour clip vidéo', description: 'Tournage d\'un clip electro house. Besoin de 6-8 danseurs. Défraiement + visibilité.', location: 'Zurich, Switzerland', event_date: '2026-02-27', tags: ['clip', 'dance', 'video'] },
      { user_id: userIds[19], type: 'other', title: 'Jam session producteurs @ mon studio', description: 'Session production collaborative. Apportez vos idées et votre laptop. Pizza & vibes.', location: 'Hamburg, Germany', event_date: '2026-02-23', tags: ['production', 'collab', 'studio'] },
      { user_id: userIds[3], type: 'festival', title: 'Organise pré-party avant Time Warp', description: 'Warm-up chez moi avant d\'aller à Time Warp. Apportez vos bouteilles!', location: 'Berlin, Germany', event_date: '2026-04-04', tags: ['preparty', 'timewarp', 'techno'] },
      { user_id: userIds[5], type: 'other', title: 'Cherche VJ pour collaboration live', description: 'Je mixe techno/house, besoin d\'un VJ pour créer une expérience audiovisuelle immersive.', location: 'Marseille, France', event_date: '2026-03-05', tags: ['vj', 'collab', 'live'] },
      { user_id: userIds[9], type: 'other', title: 'Recherche lieu pour organiser rave 200 pers', description: 'Cherche warehouse ou espace alternatif pour organiser une soirée underground.', location: 'Lyon, France', event_date: '2026-04-15', tags: ['rave', 'lieu', 'underground'] },
      { user_id: userIds[12], type: 'other', title: 'Échange services: Photos contre mix promo', description: 'Photographe dispo pour shooter ton set en échange d\'un mix promo de 1h.', location: 'Lisbon, Portugal', event_date: '2026-02-28', tags: ['photo', 'exchange', 'promo'] },
    ];

    for (const announcement of announcements) {
      await supabaseAdmin.from('announcements').insert(announcement);
    }

    const marketplaceItems = [
      { seller_id: userIds[0], title: 'Pioneer CDJ-3000 (paire) + DJM-900NXS2', description: 'Setup complet en excellent état. Utilisé uniquement en studio. Factures et boîtes d\'origine disponibles.', category: 'dj_gear', listing_type: 'sale', price: 4500, condition: 'good', location: 'Paris, France', images: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'] },
      { seller_id: userIds[4], title: 'Pioneer DDJ-1000 + Flight Case', description: 'Contrôleur DJ 4 voies en parfait état. Utilisé 10 fois maximum. Flight case Magma inclus.', category: 'dj_gear', listing_type: 'sale', price: 850, condition: 'new', location: 'Amsterdam, Netherlands', images: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'] },
      { seller_id: userIds[7], title: 'Technics SL-1200 MK7 (la paire)', description: 'Platines vinyles neuves, encore sous garantie. Jamais utilisées en extérieur.', category: 'dj_gear', listing_type: 'sale', price: 1800, condition: 'new', location: 'London, UK', images: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'] },
      { seller_id: userIds[14], title: 'Location CDJ-3000 + Mixer DJM-A9', description: 'Setup haut de gamme pour événements. Livraison et installation possibles. Caution 1000€.', category: 'dj_gear', listing_type: 'rental', price: 0, rental_price_per_day: 150, condition: 'good', location: 'Munich, Germany', images: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'] },
      { seller_id: userIds[8], title: 'Enceintes Funktion-One Res 2 (paire)', description: 'Son de référence pour clubs. Excellent état. Vente cause déménagement.', category: 'audio', listing_type: 'sale', price: 3200, condition: 'good', location: 'Barcelona, Spain', images: ['https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'] },
      { seller_id: userIds[10], title: 'Shure SM58 + pied + câble XLR', description: 'Micro légendaire en parfait état. Idéal pour MC ou prise de son.', category: 'audio', listing_type: 'sale', price: 85, condition: 'used', location: 'Vienna, Austria', images: ['https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'] },
      { seller_id: userIds[16], title: 'Location système son complet 2000W', description: 'Enceintes actives + sub + câbles. Parfait pour soirées jusqu\'à 150 personnes.', category: 'audio', listing_type: 'rental', price: 0, rental_price_per_day: 120, condition: 'good', location: 'Prague, Czech Republic', images: ['https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'] },
      { seller_id: userIds[5], title: 'Sony A7S III + 24-70mm f/2.8 GM', description: 'Camera parfaite pour la vidéo en basse lumière. Condition impeccable. 8000 déclenchements.', category: 'video', listing_type: 'sale', price: 3400, condition: 'good', location: 'Marseille, France', images: ['https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'] },
      { seller_id: userIds[12], title: 'Canon EOS R6 + objectifs 24-105mm', description: 'Boîtier hybride polyvalent + objectif stabilisé. Parfait pour photo et vidéo événementielle.', category: 'video', listing_type: 'sale', price: 2100, condition: 'good', location: 'Lisbon, Portugal', images: ['https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'] },
      { seller_id: userIds[15], title: 'Location pack vidéo pro: caméra + stabilisateur', description: 'Sony A7S III + Gimbal DJI RS3 Pro + batteries. Idéal pour capturer vos events.', category: 'video', listing_type: 'rental', price: 0, rental_price_per_day: 80, condition: 'good', location: 'Brussels, Belgium', images: ['https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'] },
      { seller_id: userIds[15], title: 'GoPro Hero 12 Black + accessoires', description: 'Caméra action avec tous les accessoires: ventouses, perches, batteries. Parfait pour POV.', category: 'video', listing_type: 'sale', price: 320, condition: 'new', location: 'Brussels, Belgium', images: ['https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'] },
      { seller_id: userIds[9], title: 'Pack 4 lyres LED wash + contrôleur DMX', description: 'Éclairage professionnel pour scène. Lyres 7x15W RGBW avec flight cases.', category: 'lighting', listing_type: 'both', price: 1200, rental_price_per_day: 60, condition: 'good', location: 'Lyon, France', images: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'] },
      { seller_id: userIds[17], title: 'Location éclairage complet pour soirée', description: 'Pack lumières: 8 projecteurs LED + strobes + machines à fumée. Installation comprise.', category: 'lighting', listing_type: 'rental', price: 0, rental_price_per_day: 100, condition: 'good', location: 'Zurich, Switzerland', images: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'] },
      { seller_id: userIds[6], title: 'Baskets danse Puma Suede (neuves, taille 42)', description: 'Sneakers parfaites pour danser. Jamais portées, taille mal commandée.', category: 'fashion', listing_type: 'sale', price: 65, condition: 'new', location: 'Rome, Italy', images: ['https://images.pexels.com/photos/1163194/pexels-photo-1163194.jpeg'] },
      { seller_id: userIds[18], title: 'Lot vêtements streetwear (5 pièces)', description: 'T-shirts + hoodies de marques streetwear. Taille M/L. Très bon état.', category: 'fashion', listing_type: 'sale', price: 120, condition: 'used', location: 'Stockholm, Sweden', images: ['https://images.pexels.com/photos/1163194/pexels-photo-1163194.jpeg'] },
    ];

    for (const item of marketplaceItems) {
      await supabaseAdmin.from('marketplace_items').insert(item);
    }

    // Create friendships (random connections between users)
    const friendships = [];
    for (let i = 0; i < userIds.length; i++) {
      const numFriends = Math.floor(Math.random() * 5) + 3; // 3-7 friends per user
      const friendIndices = new Set<number>();

      while (friendIndices.size < numFriends && friendIndices.size < userIds.length - 1) {
        const friendIdx = Math.floor(Math.random() * userIds.length);
        if (friendIdx !== i) {
          friendIndices.add(friendIdx);
        }
      }

      for (const friendIdx of friendIndices) {
        // Avoid duplicates
        const exists = friendships.find(f =>
          (f.user_id === userIds[i] && f.friend_id === userIds[friendIdx]) ||
          (f.user_id === userIds[friendIdx] && f.friend_id === userIds[i])
        );
        if (!exists) {
          friendships.push({
            user_id: userIds[i],
            friend_id: userIds[friendIdx],
            status: 'accepted'
          });
        }
      }
    }

    for (const friendship of friendships) {
      await supabaseAdmin.from('friendships').insert(friendship);
    }

    // Add friendships for the current authenticated user with all fake users
    if (currentUser) {
      for (let i = 0; i < userIds.length; i++) {
        await supabaseAdmin.from('friendships').insert({
          user_id: currentUser.id,
          friend_id: userIds[i],
          status: 'accepted'
        });
      }
    }

    // Create diverse social posts
    const categories = ['Electro', 'House', 'Techno', 'Afro House', 'Drum & Bass', 'Trance'];
    const posts = [
      // Video posts
      { user_id: userIds[0], post_type: 'video', content: '🔥 My set from last night at Rex Club! Pure techno energy 🎵', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tags: ['techno', 'live', 'rexclub'], category: 'Techno', likes_count: 234, comments_count: 45 },
      { user_id: userIds[3], post_type: 'video', content: 'New electro dance routine! What do you think? 💃', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tags: ['electro', 'dance', 'tutorial'], category: 'Electro', likes_count: 567, comments_count: 89 },
      { user_id: userIds[5], post_type: 'video', content: 'Behind the scenes of our latest music video shoot 🎬', tiktok_url: 'https://www.tiktok.com/@streetiz', tags: ['bts', 'production', 'video'], category: 'House', likes_count: 432, comments_count: 67 },
      { user_id: userIds[15], post_type: 'video', content: 'VJ setup tour - check out the gear I use for live visuals! 🖥️✨', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tags: ['vj', 'setup', 'visuals'], category: 'Techno', likes_count: 189, comments_count: 34 },

      // Audio posts
      { user_id: userIds[4], post_type: 'audio', content: 'Just dropped this new techno banger! Let me know what you think 🎧', audio_title: 'Dark Matter', audio_artist: 'TECHNOVA', audio_url: 'https://example.com/audio.mp3', audio_cover_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', tags: ['newmusic', 'techno', 'producer'], category: 'Techno', likes_count: 891, comments_count: 123 },
      { user_id: userIds[8], post_type: 'audio', content: 'Weekend vibes mix - 2 hours of pure house 🏠🎵', audio_title: 'Summer House Mix Vol.1', audio_artist: 'ZEPHYR', audio_url: 'https://example.com/audio.mp3', audio_cover_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', tags: ['house', 'mix', 'summer'], category: 'House', likes_count: 1245, comments_count: 178 },
      { user_id: userIds[19], post_type: 'audio', content: 'New bass music track! Heavy drops incoming 🔊', audio_title: 'Subsonic', audio_artist: 'ECHO', audio_url: 'https://example.com/audio.mp3', audio_cover_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', tags: ['bass', 'dnb', 'newrelease'], category: 'Drum & Bass', likes_count: 654, comments_count: 91 },

      // Photo posts
      { user_id: userIds[12], post_type: 'photo', content: 'Captured this amazing moment at the festival last weekend! 📸✨', media_urls: ['https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'], tags: ['photography', 'festival', 'moments'], category: 'House', likes_count: 723, comments_count: 56 },
      { user_id: userIds[6], post_type: 'photo', content: 'Dance crew energy! 🔥💃', media_urls: ['https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg'], tags: ['dance', 'crew', 'electro'], category: 'Electro', likes_count: 445, comments_count: 38 },
      { user_id: userIds[11], post_type: 'photo', content: 'Breaking session from yesterday. The floor was on fire! 🔥', media_urls: ['https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg', 'https://images.pexels.com/photos/1708506/pexels-photo-1708506.jpeg'], tags: ['breaking', 'bboy', 'session'], category: 'House', likes_count: 512, comments_count: 43 },

      // Article/Text posts
      { user_id: userIds[2], post_type: 'article', content: 'Just wrote about the evolution of electronic music culture in Europe 📝', article_title: 'The Underground Revolution: Electronic Music in 2026', article_link: 'https://example.com/article', article_image_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg', tags: ['article', 'culture', 'music'], category: 'House', likes_count: 367, comments_count: 89 },
      { user_id: userIds[1], post_type: 'text', content: 'Who else is going to the big rave this weekend? Can\'t wait! 🎉 Let\'s meet up!', tags: ['rave', 'weekend', 'meetup'], category: 'Techno', likes_count: 156, comments_count: 67 },
      { user_id: userIds[7], post_type: 'text', content: 'That feeling when your favorite DJ drops your track ID request 😍🎵', tags: ['dj', 'music', 'vibes'], category: 'Drum & Bass', likes_count: 289, comments_count: 34 },
      { user_id: userIds[10], post_type: 'text', content: 'Looking for recommendations: best clubs in Berlin for dark techno? 🖤', tags: ['berlin', 'techno', 'recommendations'], category: 'Techno', likes_count: 198, comments_count: 112 },
      { user_id: userIds[14], post_type: 'text', content: 'Studio session vibes 🎹 Working on some new heat! Stay tuned!', tags: ['studio', 'production', 'coming'], category: 'House', likes_count: 421, comments_count: 52 },

      // More diverse posts
      { user_id: userIds[16], post_type: 'photo', content: 'Vinyl collection update! Just got these beauties 💿✨', media_urls: ['https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg'], tags: ['vinyl', 'collector', 'music'], category: 'House', likes_count: 334, comments_count: 45 },
      { user_id: userIds[17], post_type: 'text', content: 'Huge shoutout to everyone who came to our event last night! You made it special! 🙏❤️', tags: ['thankyou', 'event', 'community'], category: 'Techno', likes_count: 678, comments_count: 93 },
      { user_id: userIds[13], post_type: 'photo', content: 'Popping workshop was absolutely fire today! 🔥 Thanks to all participants!', media_urls: ['https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg'], tags: ['workshop', 'popping', 'dance'], category: 'Electro', likes_count: 267, comments_count: 28 },
      { user_id: userIds[9], post_type: 'text', content: 'Nothing beats the energy of a packed dance floor at 3 AM 🌙✨', tags: ['nightlife', 'vibes', 'energy'], category: 'Techno', likes_count: 543, comments_count: 67 },
      { user_id: userIds[18], post_type: 'video', content: 'Freestyle session to some sick beats! 🎵💃', youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tags: ['freestyle', 'dance', 'hiphop'], category: 'Electro', likes_count: 489, comments_count: 71 },
    ];

    for (const post of posts) {
      await supabaseAdmin.from('posts').insert(post);
    }

    // Create user follows (in addition to friendships)
    const follows = [];
    for (let i = 0; i < userIds.length; i++) {
      const numFollows = Math.floor(Math.random() * 6) + 2; // 2-7 follows per user
      const followIndices = new Set<number>();

      while (followIndices.size < numFollows && followIndices.size < userIds.length - 1) {
        const followIdx = Math.floor(Math.random() * userIds.length);
        if (followIdx !== i) {
          followIndices.add(followIdx);
        }
      }

      for (const followIdx of followIndices) {
        follows.push({
          follower_id: userIds[i],
          following_id: userIds[followIdx]
        });
      }
    }

    for (const follow of follows) {
      await supabaseAdmin.from('user_follows').insert(follow);
    }

    // Update profile stats for all users
    for (const userId of userIds) {
      await supabaseAdmin.rpc('update_profile_stats', { target_user_id: userId });
    }

    // Create forum topics
    const forumTopics = [
      { user_id: userIds[0], category: 'Discussion', title: 'Best clubs in Paris for techno?', content: 'Looking for recommendations on the best techno clubs in Paris. Already been to Rex Club and Concrete, what else should I check out?', tags: ['techno', 'paris', 'clubs'], views_count: 156, replies_count: 23 },
      { user_id: userIds[3], category: 'Tips & Tricks', title: 'How to get better at popping?', content: 'I\'ve been practicing popping for 6 months but feel stuck. Any tips on how to improve? Specific exercises or tutorials you recommend?', tags: ['popping', 'dance', 'tutorial'], views_count: 234, replies_count: 45 },
      { user_id: userIds[7], category: 'Discussion', title: 'Favorite DJ sets of 2025', content: 'What were your favorite DJ sets this year? Mine: Amelie Lens at Awakenings, Carl Cox at Fabric, and Nina Kraviz at Berghain.', tags: ['dj', 'sets', '2025'], views_count: 412, replies_count: 67 },
      { user_id: userIds[2], category: 'Equipment', title: 'Pioneer CDJ-3000 vs Denon SC6000', content: 'Thinking about upgrading my setup. What do you prefer and why? Looking for honest opinions from people who\'ve used both.', tags: ['cdj', 'denon', 'equipment'], views_count: 189, replies_count: 34 },
      { user_id: userIds[11], category: 'Events', title: 'Who\'s going to Time Warp 2026?', content: 'Time Warp lineup just dropped and it\'s INSANE! Who\'s planning to go? Maybe we can organize a meetup!', tags: ['timewarp', 'festival', 'meetup'], views_count: 567, replies_count: 89 },
    ];

    for (const topic of forumTopics) {
      await supabaseAdmin.from('forum_topics').insert(topic);
    }

    // Create profile media for users (6 photos + 3 videos per user)
    const photoUrls = [
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
      'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg',
      'https://images.pexels.com/photos/1708506/pexels-photo-1708506.jpeg',
      'https://images.pexels.com/photos/2102568/pexels-photo-2102568.jpeg',
      'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
      'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg',
      'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg',
      'https://images.pexels.com/photos/1449791/pexels-photo-1449791.jpeg',
      'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg',
    ];

    const videoUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=9bZkp7q19f0',
      'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    ];

    const photoTitles = [
      'DJ Set', 'Live Performance', 'Studio Session', 'Festival Vibes',
      'Night Club', 'Backstage', 'Practice Time', 'Event Setup',
      'With the Crew', 'On Stage', 'Sound Check', 'After Party'
    ];

    const videoTitles = [
      'Performance Reel', 'Tutorial', 'Live Set', 'Behind the Scenes',
      'Workshop', 'Event Highlights'
    ];

    const profileMedia = [];

    // Add media for first 15 users
    for (let i = 0; i < Math.min(15, userIds.length); i++) {
      // Add 6 photos
      for (let j = 0; j < 6; j++) {
        profileMedia.push({
          user_id: userIds[i],
          media_type: 'photo',
          media_url: photoUrls[(i + j) % photoUrls.length],
          title: `${photoTitles[(i + j) % photoTitles.length]} ${j + 1}`,
          display_order: j
        });
      }

      // Add 3 videos
      for (let j = 0; j < 3; j++) {
        profileMedia.push({
          user_id: userIds[i],
          media_type: 'video',
          external_url: videoUrls[j % videoUrls.length],
          external_platform: 'youtube',
          title: `${videoTitles[(i + j) % videoTitles.length]} ${j + 1}`,
          display_order: 6 + j
        });
      }
    }

    // Insert media in batches of 50
    for (let i = 0; i < profileMedia.length; i += 50) {
      const batch = profileMedia.slice(i, i + 50);
      await supabaseAdmin.from('profile_media').insert(batch);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Community data seeded successfully!',
        usersCreated: userIds.length,
        announcementsCreated: announcements.length,
        marketplaceItemsCreated: marketplaceItems.length,
        postsCreated: posts.length,
        friendshipsCreated: friendships.length,
        followsCreated: follows.length,
        forumTopicsCreated: forumTopics.length,
        profileMediaCreated: profileMedia.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
