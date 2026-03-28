import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch links that need checking (unchecked or last checked > 7 days ago)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: links, error } = await supabase
      .from("items")
      .select("id, title, content, type, user_id, link_status, last_checked_at")
      .eq("type", "link")
      .or(`last_checked_at.is.null,last_checked_at.lt.${sevenDaysAgo}`)
      .limit(50);

    if (error) throw error;
    if (!links || links.length === 0) {
      return new Response(JSON.stringify({ message: "No links to check" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: { id: string; status: string; archive_url?: string }[] = [];

    for (const link of links) {
      let status = "alive";
      let archiveUrl: string | null = null;

      try {
        // Try HEAD request first, fall back to GET
        let response: Response;
        try {
          response = await fetch(link.content, {
            method: "HEAD",
            redirect: "follow",
            signal: AbortSignal.timeout(10000),
          });
        } catch {
          response = await fetch(link.content, {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(15000),
          });
        }

        if (response.ok) {
          status = "alive";
        } else if (response.status === 301 || response.status === 302 || response.status === 308) {
          status = "redirected";
        } else if (response.status >= 400) {
          status = "dead";
        }
      } catch {
        status = "dead";
      }

      // If dead, try Wayback Machine
      if (status === "dead") {
        try {
          const waybackResp = await fetch(
            `https://archive.org/wayback/available?url=${encodeURIComponent(link.content)}`,
            { signal: AbortSignal.timeout(10000) }
          );
          const waybackData = await waybackResp.json();
          if (waybackData?.archived_snapshots?.closest?.available) {
            archiveUrl = waybackData.archived_snapshots.closest.url;
          }
        } catch {
          // Wayback unavailable, continue
        }

        // Create notification for dead link
        if (link.link_status !== "dead") {
          await supabase.from("notifications").insert({
            user_id: link.user_id,
            title: "Dead Link Detected",
            message: `Your link "${link.title}" is no longer available.`,
            type: "warning",
            link_id: link.id,
          });
        }
      }

      // Update item
      const updateData: Record<string, unknown> = {
        link_status: status,
        last_checked_at: new Date().toISOString(),
      };
      if (archiveUrl) updateData.archive_url = archiveUrl;

      await supabase.from("items").update(updateData).eq("id", link.id);
      results.push({ id: link.id, status, archive_url: archiveUrl || undefined });
    }

    return new Response(JSON.stringify({ checked: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("check-links error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
