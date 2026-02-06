/*
  # Fix Posts RLS Policy

  1. Changes
    - Drop the existing "Anyone can view public posts" policy
    - Create new policy that allows both authenticated and anonymous users to view public posts
    
  2. Security
    - Maintains data security by only allowing viewing of posts with visibility='public'
    - Enables both authenticated and anonymous users to see public content
*/

DROP POLICY IF EXISTS "Anyone can view public posts" ON posts;

CREATE POLICY "Public posts are viewable by everyone"
  ON posts
  FOR SELECT
  TO authenticated, anon
  USING (visibility = 'public');
