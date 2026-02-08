-- Premium Profile V2 Enhancement
-- Adds fields for premium profile features including skills, pinned media, and booking capabilities
--
-- New Fields:
-- 1. profiles.skills - JSON array of skill tags
-- 2. profiles.pinned_media - JSON array of pinned media IDs
-- 3. profiles.booking_enabled - Boolean flag for booking feature
-- 4. profiles.profile_role - Text field for primary role (replaces old 'role')
--
-- New Tables:
-- 1. booking_requests - Stores booking/collaboration requests between users
--
-- Security:
-- - RLS enabled on booking_requests
-- - Users can see their own sent/received booking requests
-- - Only sender can cancel, only recipient can approve/deny

-- Add new fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
    ALTER TABLE profiles ADD COLUMN skills jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pinned_media') THEN
    ALTER TABLE profiles ADD COLUMN pinned_media jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'booking_enabled') THEN
    ALTER TABLE profiles ADD COLUMN booking_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_role') THEN
    ALTER TABLE profiles ADD COLUMN profile_role text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE profiles ADD COLUMN followers_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE profiles ADD COLUMN following_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'online_status') THEN
    ALTER TABLE profiles ADD COLUMN online_status text DEFAULT 'offline';
  END IF;
END $$;

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  to_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  event_date date NOT NULL,
  city text NOT NULL,
  venue text,
  request_type text NOT NULL CHECK (request_type IN ('dj_set', 'performance', 'workshop', 'collaboration', 'video', 'photo', 'other')),
  message text NOT NULL,
  budget text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT different_users_booking CHECK (from_user_id != to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_requests_from ON booking_requests(from_user_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_to ON booking_requests(to_user_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON booking_requests(event_date);

ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Senders can view their sent requests
CREATE POLICY "Users can view sent booking requests"
  ON booking_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id);

-- Recipients can view received requests
CREATE POLICY "Users can view received booking requests"
  ON booking_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = to_user_id);

-- Users can create booking requests
CREATE POLICY "Users can create booking requests"
  ON booking_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

-- Senders can cancel their requests
CREATE POLICY "Senders can cancel booking requests"
  ON booking_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = from_user_id AND status = 'pending')
  WITH CHECK (auth.uid() = from_user_id AND status = 'cancelled');

-- Recipients can approve/deny requests
CREATE POLICY "Recipients can respond to booking requests"
  ON booking_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = to_user_id AND status = 'pending')
  WITH CHECK (auth.uid() = to_user_id);

-- Function to create booking request
CREATE OR REPLACE FUNCTION create_booking_request(
  p_to_user_id uuid,
  p_event_date date,
  p_city text,
  p_venue text,
  p_request_type text,
  p_message text,
  p_budget text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id uuid;
BEGIN
  -- Check if recipient has booking enabled
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_to_user_id
    AND booking_enabled = true
  ) THEN
    RAISE EXCEPTION 'Booking not enabled for this user';
  END IF;

  -- Create the request
  INSERT INTO booking_requests (
    from_user_id,
    to_user_id,
    event_date,
    city,
    venue,
    request_type,
    message,
    budget
  )
  VALUES (
    auth.uid(),
    p_to_user_id,
    p_event_date,
    p_city,
    p_venue,
    p_request_type,
    p_message,
    p_budget
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- Function to respond to booking request
CREATE OR REPLACE FUNCTION respond_booking_request(
  p_request_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_status NOT IN ('approved', 'denied') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or denied';
  END IF;

  UPDATE booking_requests
  SET status = p_status, updated_at = now()
  WHERE id = p_request_id
  AND to_user_id = auth.uid()
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$$;

-- Function to cancel booking request
CREATE OR REPLACE FUNCTION cancel_booking_request(p_request_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE booking_requests
  SET status = 'cancelled', updated_at = now()
  WHERE id = p_request_id
  AND from_user_id = auth.uid()
  AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found or already processed';
  END IF;
END;
$$;