
-- Drop overly permissive anon SELECT policies that bypass the share_token
DROP POLICY IF EXISTS "Public can view shared collection items" ON public.shared_collection_items;
DROP POLICY IF EXISTS "Public can view items in shared collections" ON public.items;

-- New SECURITY DEFINER RPC: returns the items inside a shared collection,
-- but ONLY when the caller supplies the correct share_token.
CREATE OR REPLACE FUNCTION public.get_shared_collection_items_by_token(_token text)
RETURNS SETOF public.items
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.*
  FROM public.items i
  JOIN public.shared_collection_items sci ON sci.item_id = i.id
  JOIN public.shared_collections sc ON sc.id = sci.collection_id
  WHERE sc.share_token = _token
    AND sc.is_active = true;
$$;

REVOKE ALL ON FUNCTION public.get_shared_collection_items_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_collection_items_by_token(text) TO anon, authenticated;

-- Lock down has_role: only used by RLS internally; revoke from app roles
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
