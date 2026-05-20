import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    if (!cronSecret || req.headers.get("x-cron-secret") !== cronSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Get users who haven't opted out and haven't received digest in 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, digest_opt_out, last_digest_sent_at")
      .or(`digest_opt_out.is.null,digest_opt_out.eq.false`);

    if (profilesError) throw profilesError;

    const eligibleUsers = (profiles || []).filter((p: any) => {
      if (p.digest_opt_out) return false;
      if (!p.last_digest_sent_at) return true;
      return new Date(p.last_digest_sent_at) < new Date(sevenDaysAgo);
    });

    const results: any[] = [];

    for (const user of eligibleUsers) {
      try {
        // Get week's saved count
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: weekCount } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", oneWeekAgo);

        // Get top 3 unread links (oldest first)
        const { data: unreadLinks } = await supabase
          .from("items")
          .select("id, title, content, type")
          .eq("user_id", user.id)
          .eq("is_read", false)
          .eq("type", "link")
          .order("created_at", { ascending: true })
          .limit(3);

        const { count: totalUnread } = await supabase
          .from("items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("is_read", false);

        // AI summarize each link
        const summaries: { title: string; url: string; summary: string }[] = [];
        
        for (const link of (unreadLinks || [])) {
          let summary = "Summary not available";
          if (LOVABLE_API_KEY) {
            try {
              const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash-lite",
                  messages: [
                    { role: "system", content: "Summarize web content in exactly 2 concise sentences for a busy person." },
                    { role: "user", content: `Summarize this link titled "${link.title}" at URL: ${link.content}` },
                  ],
                }),
              });
              if (aiRes.ok) {
                const aiData = await aiRes.json();
                summary = aiData.choices?.[0]?.message?.content || summary;
              }
            } catch { /* AI failed, use default */ }
          }
          summaries.push({ title: link.title, url: link.content, summary });
        }

        // Create in-app digest notification instead of email
        // (Email sending requires email domain setup)
        const digestMessage = summaries.length > 0
          ? `📚 Weekly Digest: You saved ${weekCount || 0} links this week. ${totalUnread || 0} unread. Top pick: "${summaries[0].title}" — ${summaries[0].summary.slice(0, 100)}...`
          : `📚 Weekly Digest: You saved ${weekCount || 0} links this week. ${totalUnread || 0} links waiting to be read.`;

        await supabase.from("notifications").insert({
          user_id: user.id,
          title: "📚 Your Weekly Digest",
          message: digestMessage,
          type: "digest",
        });

        // Update last_digest_sent_at
        await supabase
          .from("profiles")
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq("id", user.id);

        results.push({ userId: user.id, status: "sent", links: summaries.length });
      } catch (userError: any) {
        results.push({ userId: user.id, status: "error", error: userError.message });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
