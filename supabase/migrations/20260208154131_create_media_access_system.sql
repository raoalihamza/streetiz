-- Media Access System
-- Creates a comprehensive system for timed media access control between connected users.
--
-- New Tables:
-- 1. media_items - Stores user photos/videos with privacy settings
-- 2. media_access_requests - Tracks access requests between users
-- 3. media_access_grants - Active access permissions with expiry
--
-- Security:
-- - RLS enabled on all tables
-- - Only owners can see their media items
-- - Only owner and requester can see requests
-- - Only owner and viewer can see grants
-- - Viewers can see media if they have an active grant
-- - Anti-spam: max 3 pending requests per viewer per owner per 24h

-- Create media_items table
CREATE TABLE IF NOT EXISTS media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'video')),
  url text NOT NULL,
  thumb_url text,
  visibility_default text NOT NULL DEFAULT 'private' CHECK (visibility_default IN ('private', 'connections')),
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_items_owner ON media_items(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_media_items_created ON media_items(created_at DESC);

-- Create media_access_requests table
CREATE TABLE IF NOT EXISTS media_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired', 'cancelled')),
  duration text NOT NULL CHECK (duration IN ('5m', '1h', 'always')),
  message text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT different_users CHECK (requester_user_id != owner_user_id)
);

CREATE INDEX IF NOT EXISTS idx_media_requests_owner ON media_access_requests(owner_user_id, status);
CREATE INDEX IF NOT EXISTS idx_media_requests_requester ON media_access_requests(requester_user_id, status);
CREATE INDEX IF NOT EXISTS idx_media_requests_created ON media_access_requests(created_at DESC);

-- Create media_access_grants table
CREATE TABLE IF NOT EXISTS media_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  viewer_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scope text NOT NULL DEFAULT 'all' CHECK (scope IN ('photos', 'videos', 'all')),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  revoked_at timestamptz,
  CONSTRAINT different_users_grant CHECK (owner_user_id != viewer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_media_grants_viewer ON media_access_grants(viewer_user_id, owner_user_id);
CREATE INDEX IF NOT EXISTS idx_media_grants_owner ON media_access_grants(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_media_grants_expires ON media_access_grants(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS on all tables
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_access_grants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_items

-- Owner can manage their own media
CREATE POLICY "Users can manage own media"
  ON media_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Viewers with active grants can see media
CREATE POLICY "Users with grants can view media"
  ON media_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM media_access_grants
      WHERE media_access_grants.owner_user_id = media_items.owner_user_id
      AND media_access_grants.viewer_user_id = auth.uid()
      AND media_access_grants.revoked_at IS NULL
      AND (media_access_grants.expires_at IS NULL OR media_access_grants.expires_at > now())
    )
  );

-- RLS Policies for media_access_requests

-- Owner can see requests sent to them
CREATE POLICY "Owners can view requests sent to them"
  ON media_access_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

-- Requesters can see their own requests
CREATE POLICY "Requesters can view own requests"
  ON media_access_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = requester_user_id);

-- Users can create requests (anti-spam enforced by function)
CREATE POLICY "Users can create requests"
  ON media_access_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_user_id);

-- Owners can update request status
CREATE POLICY "Owners can update request status"
  ON media_access_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Requesters can cancel their own requests
CREATE POLICY "Requesters can cancel own requests"
  ON media_access_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = requester_user_id AND status = 'pending')
  WITH CHECK (auth.uid() = requester_user_id AND status = 'cancelled');

-- RLS Policies for media_access_grants

-- Owners can manage grants they gave
CREATE POLICY "Owners can manage grants"
  ON media_access_grants
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_user_id)
  WITH CHECK (auth.uid() = owner_user_id);

-- Viewers can see grants they received
CREATE POLICY "Viewers can see their grants"
  ON media_access_grants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = viewer_user_id);

-- Helper function to check if viewer has active access
CREATE OR REPLACE FUNCTION check_media_access(viewer_id uuid, owner_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM media_access_grants
    WHERE viewer_user_id = viewer_id
    AND owner_user_id = owner_id
    AND revoked_at IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Function to get active grant
CREATE OR REPLACE FUNCTION get_active_grant(viewer_id uuid, owner_id uuid)
RETURNS TABLE (
  id uuid,
  scope text,
  expires_at timestamptz,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT g.id, g.scope, g.expires_at, g.created_at
  FROM media_access_grants g
  WHERE g.viewer_user_id = viewer_id
  AND g.owner_user_id = owner_id
  AND g.revoked_at IS NULL
  AND (g.expires_at IS NULL OR g.expires_at > now())
  ORDER BY g.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to create request with anti-spam check
CREATE OR REPLACE FUNCTION create_media_request(
  p_owner_id uuid,
  p_duration text,
  p_message text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id uuid;
  v_pending_count int;
BEGIN
  -- Check anti-spam: max 3 pending requests in last 24h
  SELECT COUNT(*) INTO v_pending_count
  FROM media_access_requests
  WHERE requester_user_id = auth.uid()
  AND owner_user_id = p_owner_id
  AND status = 'pending'
  AND created_at > now() - interval '24 hours';

  IF v_pending_count >= 3 THEN
    RAISE EXCEPTION 'Too many pending requests. Please wait.';
  END IF;

  -- Create the request
  INSERT INTO media_access_requests (requester_user_id, owner_user_id, duration, message)
  VALUES (auth.uid(), p_owner_id, p_duration, p_message)
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Function to approve request and create grant
CREATE OR REPLACE FUNCTION approve_media_request(p_request_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request record;
  v_grant_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Get request details
  SELECT * INTO v_request
  FROM media_access_requests
  WHERE id = p_request_id
  AND owner_user_id = auth.uid()
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;

  -- Calculate expiry
  IF v_request.duration = '5m' THEN
    v_expires_at := now() + interval '5 minutes';
  ELSIF v_request.duration = '1h' THEN
    v_expires_at := now() + interval '1 hour';
  ELSE
    v_expires_at := NULL;
  END IF;

  -- Revoke any existing grants from same owner to same viewer
  UPDATE media_access_grants
  SET revoked_at = now()
  WHERE owner_user_id = auth.uid()
  AND viewer_user_id = v_request.requester_user_id
  AND revoked_at IS NULL;

  -- Create new grant
  INSERT INTO media_access_grants (owner_user_id, viewer_user_id, scope, expires_at)
  VALUES (auth.uid(), v_request.requester_user_id, 'all', v_expires_at)
  RETURNING id INTO v_grant_id;

  -- Update request status
  UPDATE media_access_requests
  SET status = 'approved', updated_at = now()
  WHERE id = p_request_id;

  RETURN v_grant_id;
END;
$$;

-- Function to deny request
CREATE OR REPLACE FUNCTION deny_media_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE media_access_requests
  SET status = 'denied', updated_at = now()
  WHERE id = p_request_id
  AND owner_user_id = auth.uid()
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$$;

-- Function to revoke grant
CREATE OR REPLACE FUNCTION revoke_media_grant(p_grant_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE media_access_grants
  SET revoked_at = now()
  WHERE id = p_grant_id
  AND owner_user_id = auth.uid()
  AND revoked_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Grant not found or already revoked';
  END IF;
END;
$$;