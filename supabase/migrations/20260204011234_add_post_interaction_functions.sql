/*
  # Add Post Interaction Functions

  1. Functions
    - increment_post_likes: Safely increment likes_count
    - decrement_post_likes: Safely decrement likes_count
    - increment_post_comments: Safely increment comments_count
    - increment_post_shares: Safely increment shares_count
    - increment_post_saves: Safely increment saves_count
    - decrement_post_saves: Safely decrement saves_count

  2. Security
    - All functions are public and can be called by authenticated users
    - Functions handle race conditions safely
*/

-- Function to increment post likes
CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$;

-- Function to decrement post likes
CREATE OR REPLACE FUNCTION decrement_post_likes(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = post_id;
END;
$$;

-- Function to increment post comments
CREATE OR REPLACE FUNCTION increment_post_comments(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$;

-- Function to increment post shares
CREATE OR REPLACE FUNCTION increment_post_shares(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET shares_count = shares_count + 1
  WHERE id = post_id;
END;
$$;

-- Function to increment post saves
CREATE OR REPLACE FUNCTION increment_post_saves(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET saves_count = saves_count + 1
  WHERE id = post_id;
END;
$$;

-- Function to decrement post saves
CREATE OR REPLACE FUNCTION decrement_post_saves(post_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE posts
  SET saves_count = GREATEST(0, saves_count - 1)
  WHERE id = post_id;
END;
$$;