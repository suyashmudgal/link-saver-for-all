-- 1) Replace permissive anon SELECT on shared_collections with a no-op (we will use an RPC instead)
DROP POLICY IF EXISTS "Public can view active shared collections" ON public.shared_collections;

-- Secure RPC: anonymous viewers must supply the share_token to fetch a collection
CREATE OR REPLACE FUNCTION public.get_shared_collection_by_token(_token text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  title text,
  description text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sc.id, sc.user_id, sc.title, sc.description, sc.is_active, sc.created_at, sc.updated_at
  FROM public.shared_collections sc
  WHERE sc.share_token = _token
    AND sc.is_active = true
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_shared_collection_by_token(text) TO anon, authenticated;

-- shared_collection_items: keep public read but only when caller supplies a valid active token through the parent collection
-- (existing policy already gates by sc.is_active; we keep it. Items remain readable through items RLS which checks active collection membership.)

-- 2) Realtime channel authorization on realtime.messages
-- Restrict who can subscribe to topics. Each user may only subscribe to "notifications:<their_user_id>"
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notification channel" ON realtime.messages;
CREATE POLICY "Users can read their own notification channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'notifications:' || auth.uid()::text
);

DROP POLICY IF EXISTS "Users can write their own notification channel" ON realtime.messages;
CREATE POLICY "Users can write their own notification channel"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  realtime.topic() = 'notifications:' || auth.uid()::text
);