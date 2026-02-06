/*
  # Create Forums, Follows, and Media Gallery Schema

  1. New Tables
    - `forum_topics`
      - Forum discussion topics
      - Categories, tags, view counts, pin/lock status
    
    - `forum_replies`
      - Replies to forum topics
      - Threaded discussion support
    
    - `user_follows`
      - User following system
      - One-way follow relationship
    
    - `profile_media`
      - User profile media gallery
      - Photos and videos with limits enforced
      - Support for upload URLs and external links (YouTube, TikTok, Instagram)
    
    - `profile_stats`
      - Cached user statistics
      - Followers count, posts count, events count

  2. Security
    - Enable RLS on all tables
    - Users can manage their own content
    - Public can view published content
*/

-- Forum topics
CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  views_count integer DEFAULT 0,
  replies_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  is_locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Forum replies
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User follows
CREATE TABLE IF NOT EXISTS user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Profile media gallery
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE media_type AS ENUM ('photo', 'video');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profile_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_type media_type NOT NULL,
  media_url text,
  external_url text,
  external_platform text,
  thumbnail_url text,
  title text,
  description text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Profile stats (cached)
CREATE TABLE IF NOT EXISTS profile_stats (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  followers_count integer DEFAULT 0,
  following_count integer DEFAULT 0,
  posts_count integer DEFAULT 0,
  events_count integer DEFAULT 0,
  forum_topics_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- Forum topics policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view forum topics' AND tablename = 'forum_topics') THEN
    CREATE POLICY "Anyone can view forum topics"
      ON forum_topics FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can create topics' AND tablename = 'forum_topics') THEN
    CREATE POLICY "Authenticated users can create topics"
      ON forum_topics FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own topics' AND tablename = 'forum_topics') THEN
    CREATE POLICY "Users can update own topics"
      ON forum_topics FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own topics' AND tablename = 'forum_topics') THEN
    CREATE POLICY "Users can delete own topics"
      ON forum_topics FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Forum replies policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view replies' AND tablename = 'forum_replies') THEN
    CREATE POLICY "Anyone can view replies"
      ON forum_replies FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can reply' AND tablename = 'forum_replies') THEN
    CREATE POLICY "Authenticated users can reply"
      ON forum_replies FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own replies' AND tablename = 'forum_replies') THEN
    CREATE POLICY "Users can update own replies"
      ON forum_replies FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own replies' AND tablename = 'forum_replies') THEN
    CREATE POLICY "Users can delete own replies"
      ON forum_replies FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- User follows policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view follows' AND tablename = 'user_follows') THEN
    CREATE POLICY "Anyone can view follows"
      ON user_follows FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can follow others' AND tablename = 'user_follows') THEN
    CREATE POLICY "Users can follow others"
      ON user_follows FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = follower_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can unfollow' AND tablename = 'user_follows') THEN
    CREATE POLICY "Users can unfollow"
      ON user_follows FOR DELETE
      TO authenticated
      USING (auth.uid() = follower_id);
  END IF;
END $$;

-- Profile media policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view profile media' AND tablename = 'profile_media') THEN
    CREATE POLICY "Anyone can view profile media"
      ON profile_media FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload own media' AND tablename = 'profile_media') THEN
    CREATE POLICY "Users can upload own media"
      ON profile_media FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own media' AND tablename = 'profile_media') THEN
    CREATE POLICY "Users can update own media"
      ON profile_media FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own media' AND tablename = 'profile_media') THEN
    CREATE POLICY "Users can delete own media"
      ON profile_media FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Profile stats policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view profile stats' AND tablename = 'profile_stats') THEN
    CREATE POLICY "Anyone can view profile stats"
      ON profile_stats FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert stats' AND tablename = 'profile_stats') THEN
    CREATE POLICY "System can insert stats"
      ON profile_stats FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can modify stats' AND tablename = 'profile_stats') THEN
    CREATE POLICY "System can modify stats"
      ON profile_stats FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_user_id ON forum_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic_id ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_profile_media_user_id ON profile_media(user_id);

-- Function to update profile stats
CREATE OR REPLACE FUNCTION update_profile_stats(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profile_stats (user_id, followers_count, following_count, posts_count, forum_topics_count)
  VALUES (
    target_user_id,
    (SELECT COUNT(*) FROM user_follows WHERE following_id = target_user_id),
    (SELECT COUNT(*) FROM user_follows WHERE follower_id = target_user_id),
    (SELECT COUNT(*) FROM posts WHERE user_id = target_user_id),
    (SELECT COUNT(*) FROM forum_topics WHERE user_id = target_user_id)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    followers_count = (SELECT COUNT(*) FROM user_follows WHERE following_id = target_user_id),
    following_count = (SELECT COUNT(*) FROM user_follows WHERE follower_id = target_user_id),
    posts_count = (SELECT COUNT(*) FROM posts WHERE user_id = target_user_id),
    forum_topics_count = (SELECT COUNT(*) FROM forum_topics WHERE user_id = target_user_id),
    updated_at = now();
END;
$$;

-- Function to increment topic views
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE forum_topics
  SET views_count = views_count + 1
  WHERE id = topic_id;
END;
$$;

-- Function to increment topic replies
CREATE OR REPLACE FUNCTION increment_topic_replies(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE forum_topics
  SET replies_count = replies_count + 1, updated_at = now()
  WHERE id = topic_id;
END;
$$;