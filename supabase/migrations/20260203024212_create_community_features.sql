/*
  # Community Features Migration

  ## Overview
  This migration adds comprehensive community features to Streetiz including:
  - Enhanced user profiles with social links and location
  - Follow system for user connections
  - Direct messaging and chat conversations
  - Community announcements (events, carpooling, +1, workshops)
  - Marketplace for equipment sales and rentals

  ## New Tables

  ### 1. `profile_extensions`
  Extends the existing profiles table with community-specific fields:
  - `location` (text) - User's city/location
  - `country` (text) - User's country
  - `profile_role` (text) - DJ, Dancer, Creator, etc.
  - `social_links` (jsonb) - Instagram, TikTok, YouTube, etc.
  - `followers_count` (int) - Number of followers
  - `following_count` (int) - Number of people they follow
  - `online_status` (text) - online, offline, away
  - `last_seen` (timestamptz) - Last activity timestamp

  ### 2. `follows`
  Tracks follower/following relationships:
  - `follower_id` (uuid) - User who is following
  - `following_id` (uuid) - User being followed
  - `created_at` (timestamptz)

  ### 3. `conversations`
  Manages DM conversation threads:
  - `id` (uuid, primary key)
  - `participant_ids` (uuid[]) - Array of user IDs in conversation
  - `is_group` (boolean) - true for group chats
  - `name` (text) - Group name (nullable)
  - `last_message_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 4. `messages`
  Stores all chat messages:
  - `id` (uuid, primary key)
  - `conversation_id` (uuid) - Foreign key to conversations
  - `sender_id` (uuid) - Foreign key to profiles
  - `content` (text) - Message text
  - `message_type` (text) - text, image, link
  - `read_by` (uuid[]) - Array of user IDs who read the message
  - `created_at` (timestamptz)

  ### 5. `announcements`
  Community announcements (festivals, concerts, +1, workshops, carpooling):
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Creator of announcement
  - `type` (text) - festival, concert, plus_one, carpooling, workshop, gear_sale
  - `title` (text)
  - `description` (text)
  - `location` (text)
  - `event_date` (timestamptz) - nullable
  - `tags` (text[])
  - `contact_method` (text) - chat, phone, email
  - `status` (text) - active, closed, expired
  - `created_at` (timestamptz)

  ### 6. `marketplace_items`
  Equipment marketplace for buying/selling/renting:
  - `id` (uuid, primary key)
  - `seller_id` (uuid) - Foreign key to profiles
  - `title` (text)
  - `description` (text)
  - `category` (text) - dj_gear, audio, video, lighting, fashion
  - `listing_type` (text) - sale, rental
  - `price` (numeric)
  - `rental_price_per_day` (numeric) - nullable
  - `condition` (text) - new, good, used
  - `location` (text)
  - `images` (text[]) - Array of image URLs
  - `status` (text) - available, reserved, sold
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all new tables
  - Add restrictive policies for authenticated users
  - Ensure users can only access their own data and public data
*/

-- =============================================
-- 1. PROFILE EXTENSIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS profile_extensions (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  location text,
  country text,
  profile_role text CHECK (profile_role IN ('dj', 'dancer', 'creator', 'photographer', 'videographer', 'organizer', 'clubber')),
  social_links jsonb DEFAULT '{}'::jsonb,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  online_status text DEFAULT 'offline' CHECK (online_status IN ('online', 'offline', 'away')),
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profile_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profile extensions"
  ON profile_extensions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile extension"
  ON profile_extensions FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile extension"
  ON profile_extensions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. FOLLOWS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- =============================================
-- 3. CONVERSATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids uuid[] NOT NULL,
  is_group boolean DEFAULT false,
  name text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participant_ids))
  WITH CHECK (auth.uid() = ANY(participant_ids));

-- =============================================
-- 4. MESSAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'link')),
  read_by uuid[] DEFAULT ARRAY[]::uuid[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND auth.uid() = ANY(conversations.participant_ids)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- =============================================
-- 5. ANNOUNCEMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('festival', 'concert', 'plus_one', 'carpooling', 'workshop', 'gear_sale', 'other')),
  title text NOT NULL,
  description text NOT NULL,
  location text,
  event_date timestamptz,
  tags text[] DEFAULT ARRAY[]::text[],
  contact_method text DEFAULT 'chat' CHECK (contact_method IN ('chat', 'phone', 'email')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 6. MARKETPLACE ITEMS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('dj_gear', 'audio', 'video', 'lighting', 'fashion', 'accessories', 'other')),
  listing_type text NOT NULL CHECK (listing_type IN ('sale', 'rental', 'both')),
  price numeric DEFAULT 0,
  rental_price_per_day numeric,
  condition text DEFAULT 'good' CHECK (condition IN ('new', 'good', 'used')),
  location text,
  images text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view available marketplace items"
  ON marketplace_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create marketplace listings"
  ON marketplace_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own listings"
  ON marketplace_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete own listings"
  ON marketplace_items FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_announcements_user ON announcements(user_id);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_category ON marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_items(status);

-- =============================================
-- FUNCTIONS FOR FOLLOW COUNTS
-- =============================================

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profile_extensions
    SET following_count = following_count + 1
    WHERE id = NEW.follower_id;
    
    UPDATE profile_extensions
    SET followers_count = followers_count + 1
    WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profile_extensions
    SET following_count = GREATEST(0, following_count - 1)
    WHERE id = OLD.follower_id;
    
    UPDATE profile_extensions
    SET followers_count = GREATEST(0, followers_count - 1)
    WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
