# Community Sample Data Setup

This guide explains how to populate the Community page with sample data for testing.

## 🎯 What Gets Created

When you run the seed function, it creates:

- **20 fake user profiles** with complete details:
  - DJ RYLEX, MIA VIBES, KOSMO, LUMY, TECHNOVA, VJ AMBER, LEXA MOTION, DJ NOVA, ZEPHYR, LUNA, KRAKEN, PHOENIX, AXEL, MAYA, VOLTIX, NEO, STELLA, THUNDER, BLAZE, ECHO
  - Each with role, location, bio, follower counts, online status

- **10+ announcements** covering:
  - Festival tickets & +1 requests
  - Carpooling offers
  - Workshop announcements
  - Plus one requests

- **5+ marketplace items**:
  - DJ equipment (CDJs, mixers)
  - Video cameras
  - Lighting gear
  - All with prices, locations, and photos

## 🚀 How to Seed Data

### Option 1: Call the Edge Function directly

Open your browser console on any page of the app and run:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

fetch(`${supabaseUrl}/functions/v1/seed-community-data`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  }
})
.then(res => res.json())
.then(data => console.log('Seeding result:', data))
.catch(err => console.error('Error:', err));
```

### Option 2: Use cURL

```bash
curl -X POST \
  "${VITE_SUPABASE_URL}/functions/v1/seed-community-data" \
  -H "Authorization: Bearer ${VITE_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json"
```

## 📝 Test User Credentials

You can also create a test user manually:

**Email:** `streetiztest@example.com`
**Password:** `Streetiz2026!`

Or use any of the auto-created user accounts:
- `djrylex@streetiz.test` (password: `Streetiz2026!`)
- `miavibes@streetiz.test` (password: `Streetiz2026!`)
- `kosmo_creator@streetiz.test` (password: `Streetiz2026!`)
- ... and 17 more!

All users share the same password: `Streetiz2026!`

## 🎨 What You'll See

After seeding:

### Profiles Tab
- 20 community members in a 4-column grid
- Search functionality
- Filter by role (DJ, Dancer, Creator, etc.)
- Online status indicators
- Click any profile to open detailed modal

### Announcements Tab
- Various types: Festival, Carpooling, Workshop, Plus One
- Filter by type
- Contact buttons to start conversations

### Marketplace Tab
- Equipment listings with photos
- Prices for sale/rental
- Category filters
- Contact sellers directly

### Chat Tab
- Ready for direct messages
- Login with any test account to start chatting

## ⚠️ Important Notes

- The seed function creates real auth users in Supabase
- Only run this once unless you want duplicate data
- All test users can be deleted from Supabase Auth dashboard if needed
- The function is designed to be idempotent (safe to run multiple times)

## 🔧 Troubleshooting

If the seed function fails:
1. Check that the edge function is deployed
2. Verify your Supabase environment variables are correct
3. Check browser console for detailed error messages
4. Ensure RLS policies are correctly set up

## 🧪 Testing Features

Once data is seeded, you can test:

✅ Profile browsing and search
✅ Role filtering
✅ Profile modal with follow functionality
✅ Announcements browsing and filtering
✅ Marketplace browsing and filtering
✅ Direct messaging (login first)
✅ Starting conversations from Contact buttons

Enjoy testing the Community features!
