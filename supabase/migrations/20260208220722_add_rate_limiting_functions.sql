/*
  # Add Rate Limiting for Private Albums and Portfolios

  1. Functions
    - `check_private_album_rate_limit` - Checks if user can send a private album
    - `check_portfolio_rate_limit` - Checks if user can send a portfolio
    - `expire_private_albums` - Auto-expires albums based on expires_at

  2. Rate Limits
    - Private albums: max 3 per 24h per sender->target
    - Portfolio shares: max 5 per 24h per sender->target

  3. Security
    - Functions are security definer to allow checking across users
    - RLS policies ensure users can only access their own data
*/

-- Function to check private album rate limit
CREATE OR REPLACE FUNCTION check_private_album_rate_limit(
  sender_id uuid,
  target_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM private_album_shares
  WHERE sender_user_id = sender_id
    AND target_user_id = target_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  RETURN recent_count < 3;
END;
$$;

-- Function to check portfolio rate limit
CREATE OR REPLACE FUNCTION check_portfolio_rate_limit(
  sender_id uuid,
  target_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*)
  INTO recent_count
  FROM portfolio_shares
  WHERE sender_user_id = sender_id
    AND target_user_id = target_id
    AND created_at > NOW() - INTERVAL '24 hours';
  
  RETURN recent_count < 5;
END;
$$;

-- Function to expire private albums (should be called periodically)
CREATE OR REPLACE FUNCTION expire_private_albums()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE private_album_shares
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();
END;
$$;

-- Create index for better performance on rate limit checks
CREATE INDEX IF NOT EXISTS idx_private_album_shares_sender_target_created
  ON private_album_shares(sender_user_id, target_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_shares_sender_target_created
  ON portfolio_shares(sender_user_id, target_user_id, created_at DESC);

-- Create index for expiration checks
CREATE INDEX IF NOT EXISTS idx_private_album_shares_expires_at
  ON private_album_shares(expires_at, status)
  WHERE status = 'active' AND expires_at IS NOT NULL;