
-- Add new columns to items table for all 4 features
ALTER TABLE public.items 
  ADD COLUMN IF NOT EXISTS link_status text DEFAULT 'unchecked',
  ADD COLUMN IF NOT EXISTS archive_url text,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS unlock_date timestamptz,
  ADD COLUMN IF NOT EXISTS future_message text,
  ADD COLUMN IF NOT EXISTS is_locked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS save_reason text,
  ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;

-- Add digest_opt_out to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS digest_opt_out boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_digest_sent_at timestamptz;

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  link_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create link_visits table for tracking reads
CREATE TABLE IF NOT EXISTS public.link_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  visited_at timestamptz DEFAULT now()
);

ALTER TABLE public.link_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own visits"
  ON public.link_visits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own visits"
  ON public.link_visits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
