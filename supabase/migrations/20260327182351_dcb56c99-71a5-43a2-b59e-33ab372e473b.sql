
-- Shared collections table
CREATE TABLE public.shared_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  share_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Junction table for collection items
CREATE TABLE public.shared_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.shared_collections(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, item_id)
);

-- Enable RLS
ALTER TABLE public.shared_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_collection_items ENABLE ROW LEVEL SECURITY;

-- RLS: owners manage their collections
CREATE POLICY "Users can manage their own collections" ON public.shared_collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS: collection items managed by collection owner
CREATE POLICY "Users can manage their collection items" ON public.shared_collection_items FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.shared_collections sc WHERE sc.id = collection_id AND sc.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.shared_collections sc WHERE sc.id = collection_id AND sc.user_id = auth.uid())
);

-- Public read for active shared collections (anyone with token)
CREATE POLICY "Public can view active shared collections" ON public.shared_collections FOR SELECT TO anon USING (is_active = true);

-- Public read for items in active collections
CREATE POLICY "Public can view shared collection items" ON public.shared_collection_items FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM public.shared_collections sc WHERE sc.id = collection_id AND sc.is_active = true)
);

-- Public read for items that are in shared collections
CREATE POLICY "Public can view items in shared collections" ON public.items FOR SELECT TO anon USING (
  EXISTS (
    SELECT 1 FROM public.shared_collection_items sci
    JOIN public.shared_collections sc ON sc.id = sci.collection_id
    WHERE sci.item_id = items.id AND sc.is_active = true
  )
);

-- Updated_at trigger
CREATE TRIGGER update_shared_collections_updated_at BEFORE UPDATE ON public.shared_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
