/*
  # Fix Marketplace Items RLS Policy

  1. Changes
    - Drop the existing view policy
    - Create new policy that allows both authenticated and anonymous users to view marketplace items
    
  2. Security
    - Maintains proper access control for create/update/delete operations (authenticated only)
    - Allows public browsing of marketplace items for better discoverability
*/

DROP POLICY IF EXISTS "Users can view available marketplace items" ON marketplace_items;

CREATE POLICY "Marketplace items are viewable by everyone"
  ON marketplace_items
  FOR SELECT
  TO authenticated, anon
  USING (true);
