import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the calling user is admin
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check admin role using service role
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: roleData } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'list_users': {
        // Get all users from auth.users via admin API
        const { data: { users }, error } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
        if (error) throw error;

        // Get profiles and item counts
        const { data: profiles } = await serviceClient.from('profiles').select('*');
        const { data: items } = await serviceClient.from('items').select('id, user_id');
        const { data: roles } = await serviceClient.from('user_roles').select('*');

        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        const itemCountMap = new Map<string, number>();
        (items || []).forEach(i => { itemCountMap.set(i.user_id, (itemCountMap.get(i.user_id) || 0) + 1); });
        const roleMap = new Map<string, string[]>();
        (roles || []).forEach(r => {
          const existing = roleMap.get(r.user_id) || [];
          existing.push(r.role);
          roleMap.set(r.user_id, existing);
        });

        const enrichedUsers = (users || []).map(u => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          full_name: profileMap.get(u.id)?.full_name || null,
          avatar_url: profileMap.get(u.id)?.avatar_url || null,
          is_blocked: profileMap.get(u.id)?.is_blocked || false,
          last_active_at: profileMap.get(u.id)?.last_active_at || null,
          item_count: itemCountMap.get(u.id) || 0,
          roles: roleMap.get(u.id) || ['user'],
        }));

        return new Response(JSON.stringify({ users: enrichedUsers }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'get_user_items': {
        const { userId } = params;
        const { data: items, error } = await serviceClient
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ items }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete_user': {
        const { userId } = params;
        const { error } = await serviceClient.auth.admin.deleteUser(userId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'delete_item': {
        const { itemId } = params;
        const { error } = await serviceClient.from('items').delete().eq('id', itemId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'block_user': {
        const { userId, blocked } = params;
        const { error } = await serviceClient.from('profiles').update({ is_blocked: blocked }).eq('id', userId);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'promote_user': {
        const { userId, role } = params;
        const { error } = await serviceClient.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'demote_user': {
        const { userId, role } = params;
        const { error } = await serviceClient.from('user_roles').delete().eq('user_id', userId).eq('role', role);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'platform_stats': {
        const { data: { users } } = await serviceClient.auth.admin.listUsers({ perPage: 1000 });
        const { data: items } = await serviceClient.from('items').select('id, type, is_favorite, created_at, user_id');
        const { data: profiles } = await serviceClient.from('profiles').select('last_active_at');

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const activeUsers = (profiles || []).filter(p => p.last_active_at && new Date(p.last_active_at) > weekAgo).length;

        return new Response(JSON.stringify({
          totalUsers: users?.length || 0,
          totalItems: items?.length || 0,
          totalFavorites: (items || []).filter(i => i.is_favorite).length,
          activeUsers,
          items: items || [],
          users: (users || []).map(u => ({ id: u.id, created_at: u.created_at })),
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Admin function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
