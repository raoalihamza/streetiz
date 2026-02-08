/*
  # Profile Sharing System

  Creates tables and policies for private album sharing and portfolio sharing features.

  ## New Tables

  ### `private_album_shares`
  - `id` (uuid, primary key)
  - `sender_user_id` (uuid, references profiles.id)
  - `target_user_id` (uuid, references profiles.id)
  - `scope` (text: 'photos', 'videos', 'all')
  - `duration` (text: '5m', '1h', 'always')
  - `expires_at` (timestamptz, nullable)
  - `message` (text, nullable)
  - `status` (text: 'active', 'expired', 'revoked')
  - `created_at` (timestamptz)

  ### `private_album_items`
  - `id` (uuid, primary key)
  - `share_id` (uuid, references private_album_shares.id)
  - `media_type` (text: 'photo', 'video')
  - `media_url` (text)
  - `thumbnail_url` (text, nullable)
  - `created_at` (timestamptz)

  ### `portfolio_shares`
  - `id` (uuid, primary key)
  - `sender_user_id` (uuid, references profiles.id)
  - `target_user_id` (uuid, references profiles.id)
  - `portfolio_type` (text)
  - `message` (text, nullable)
  - `external_link` (text, nullable)
  - `status` (text: 'active', 'revoked')
  - `created_at` (timestamptz)

  ### `portfolio_files`
  - `id` (uuid, primary key)
  - `share_id` (uuid, references portfolio_shares.id)
  - `file_url` (text)
  - `file_type` (text)
  - `thumbnail_url` (text, nullable)
  - `created_at` (timestamptz)

  ### `user_blocks`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles.id)
  - `blocked_user_id` (uuid, references profiles.id)
  - `created_at` (timestamptz)

  ### `user_reports`
  - `id` (uuid, primary key)
  - `reporter_user_id` (uuid, references profiles.id)
  - `reported_user_id` (uuid, references profiles.id)
  - `reason` (text)
  - `description` (text, nullable)
  - `status` (text: 'pending', 'reviewed', 'resolved')
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Policies ensure users can only access their own shares and blocks
  - Target users can view shares sent to them
*/

-- Private Album Shares
CREATE TABLE IF NOT EXISTS private_album_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  scope text NOT NULL DEFAULT 'all',
  duration text NOT NULL DEFAULT '5m',
  expires_at timestamptz,
  message text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE private_album_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sent albums"
  ON private_album_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can view albums sent to them"
  ON private_album_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = target_user_id);

CREATE POLICY "Users can create album shares"
  ON private_album_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Senders can update their album shares"
  ON private_album_shares FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_user_id)
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Senders can delete their album shares"
  ON private_album_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_user_id);

-- Private Album Items
CREATE TABLE IF NOT EXISTS private_album_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid REFERENCES private_album_shares(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL,
  media_url text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE private_album_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items from their shares"
  ON private_album_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_album_shares
      WHERE private_album_shares.id = private_album_items.share_id
      AND (
        private_album_shares.sender_user_id = auth.uid()
        OR private_album_shares.target_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create items for their shares"
  ON private_album_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM private_album_shares
      WHERE private_album_shares.id = private_album_items.share_id
      AND private_album_shares.sender_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their shares"
  ON private_album_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM private_album_shares
      WHERE private_album_shares.id = private_album_items.share_id
      AND private_album_shares.sender_user_id = auth.uid()
    )
  );

-- Portfolio Shares
CREATE TABLE IF NOT EXISTS portfolio_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  portfolio_type text NOT NULL,
  message text,
  external_link text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE portfolio_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sent portfolios"
  ON portfolio_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can view portfolios sent to them"
  ON portfolio_shares FOR SELECT
  TO authenticated
  USING (auth.uid() = target_user_id);

CREATE POLICY "Users can create portfolio shares"
  ON portfolio_shares FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Senders can update their portfolio shares"
  ON portfolio_shares FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_user_id)
  WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Senders can delete their portfolio shares"
  ON portfolio_shares FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_user_id);

-- Portfolio Files
CREATE TABLE IF NOT EXISTS portfolio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id uuid REFERENCES portfolio_shares(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  thumbnail_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE portfolio_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view files from their portfolios"
  ON portfolio_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_shares
      WHERE portfolio_shares.id = portfolio_files.share_id
      AND (
        portfolio_shares.sender_user_id = auth.uid()
        OR portfolio_shares.target_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create files for their portfolios"
  ON portfolio_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolio_shares
      WHERE portfolio_shares.id = portfolio_files.share_id
      AND portfolio_shares.sender_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their portfolios"
  ON portfolio_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portfolio_shares
      WHERE portfolio_shares.id = portfolio_files.share_id
      AND portfolio_shares.sender_user_id = auth.uid()
    )
  );

-- User Blocks
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, blocked_user_id)
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocks"
  ON user_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create blocks"
  ON user_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their blocks"
  ON user_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Reports
CREATE TABLE IF NOT EXISTS user_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reports"
  ON user_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_user_id);

CREATE POLICY "Users can create reports"
  ON user_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_private_album_shares_sender ON private_album_shares(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_private_album_shares_target ON private_album_shares(target_user_id);
CREATE INDEX IF NOT EXISTS idx_private_album_shares_expires ON private_album_shares(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_sender ON portfolio_shares(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_target ON portfolio_shares(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_user ON user_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON user_reports(reported_user_id);