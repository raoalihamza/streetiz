/*
  # Add increment views function

  1. New Functions
    - `increment_views` - Safely increments view count for news articles
      - Takes row_id (uuid) as parameter
      - Atomically increments views column
      - Returns void
  
  2. Security
    - Function is accessible to all users (public read-only operation)
    - Uses SECURITY DEFINER to ensure atomic update
*/

CREATE OR REPLACE FUNCTION increment_views(row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE news
  SET views = COALESCE(views, 0) + 1
  WHERE id = row_id;
END;
$$;