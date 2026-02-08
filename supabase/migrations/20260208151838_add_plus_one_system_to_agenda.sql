/*
  # Add +1 System and Custom Events to User Agenda

  1. Changes to user_agenda_events table
    - Add `available_spots` (integer) - Number of available spots (0-3)
    - Add `looking_for_plus_one` (boolean) - User is looking for someone to join
    - Add `color` (text) - Optional color for custom events
    - Update event_type to support "custom" type
    
  2. Purpose
    - Allow users to indicate they have available spots
    - Allow users to indicate they're looking for a +1
    - Support custom personal events with custom colors
    - Display badges in calendar and profile views
*/

-- Add +1 fields to user_agenda_events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_agenda_events' AND column_name = 'available_spots'
  ) THEN
    ALTER TABLE user_agenda_events ADD COLUMN available_spots integer DEFAULT 0 CHECK (available_spots >= 0 AND available_spots <= 3);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_agenda_events' AND column_name = 'looking_for_plus_one'
  ) THEN
    ALTER TABLE user_agenda_events ADD COLUMN looking_for_plus_one boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_agenda_events' AND column_name = 'color'
  ) THEN
    ALTER TABLE user_agenda_events ADD COLUMN color text DEFAULT '';
  END IF;
END $$;

-- Create index for finding events with +1 availability
CREATE INDEX IF NOT EXISTS idx_agenda_plus_one ON user_agenda_events(user_id, event_date) 
WHERE available_spots > 0 OR looking_for_plus_one = true;