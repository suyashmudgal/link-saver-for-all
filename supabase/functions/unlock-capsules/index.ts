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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find locked capsules that should be unlocked
    const now = new Date().toISOString();
    const { data: capsules, error } = await supabase
      .from("items")
      .select("id, title, user_id")
      .eq("is_locked", true)
      .lte("unlock_date", now);

    if (error) throw error;
    if (!capsules || capsules.length === 0) {
      return new Response(JSON.stringify({ message: "No capsules to unlock" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const capsule of capsules) {
      // Unlock the capsule
      await supabase.from("items").update({ is_locked: false }).eq("id", capsule.id);

      // Create notification
      await supabase.from("notifications").insert({
        user_id: capsule.user_id,
        title: "Time Capsule Opened! 🎉",
        message: `Your time capsule "${capsule.title}" has been unlocked!`,
        type: "capsule",
        link_id: capsule.id,
      });
    }

    return new Response(JSON.stringify({ unlocked: capsules.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("unlock-capsules error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
