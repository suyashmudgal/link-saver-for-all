
-- Add new columns to items table for Priority Read Queue
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
