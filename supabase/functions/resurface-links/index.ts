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

    // Find snoozed links where snoozed_until has passed
    const { data: snoozedLinks, error } = await supabase
      .from("items")
      .select("id, title, user_id")
      .not("snoozed_until", "is", null)
      .lte("snoozed_until", new Date().toISOString());

    if (error) throw error;

    if (snoozedLinks && snoozedLinks.length > 0) {
      // Reset snoozed_until for resurfaced links
      const ids = snoozedLinks.map((l: any) => l.id);
      await supabase
        .from("items")
        .update({ snoozed_until: null })
        .in("id", ids);

      // Create notifications for each user
      const notifications = snoozedLinks.map((link: any) => ({
        user_id: link.user_id,
        title: "⏰ Link Resurfaced",
        message: `Your snoozed link "${link.title}" is ready to read!`,
        type: "resurface",
        link_id: link.id,
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return new Response(
      JSON.stringify({ resurfaced: snoozedLinks?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
