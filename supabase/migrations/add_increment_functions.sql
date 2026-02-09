-- Add increment functions for views counters
-- Run this in Supabase SQL Editor

-- Function to increment casting views
CREATE OR REPLACE FUNCTION increment_casting_views(casting_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE castings_jobs
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = casting_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment marketplace item views
CREATE OR REPLACE FUNCTION increment_marketplace_views(item_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_items
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment news views (already referenced in NewsService)
CREATE OR REPLACE FUNCTION increment_news_views(news_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE news
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = news_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post likes (already referenced in PostsService)
CREATE OR REPLACE FUNCTION increment_post_likes(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment post comments (already referenced in PostsService)
CREATE OR REPLACE FUNCTION increment_post_comments(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE posts
  SET comments_count = COALESCE(comments_count, 0) + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment forum topic views (already referenced in ForumService)
CREATE OR REPLACE FUNCTION increment_topic_views(topic_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment forum topic replies (already referenced in ForumService)
CREATE OR REPLACE FUNCTION increment_topic_replies(topic_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_topics
  SET replies_count = COALESCE(replies_count, 0) + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_casting_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_marketplace_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_news_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_likes TO authenticated;
GRANT EXECUTE ON FUNCTION increment_post_comments TO authenticated;
GRANT EXECUTE ON FUNCTION increment_topic_views TO authenticated;
GRANT EXECUTE ON FUNCTION increment_topic_replies TO authenticated;
