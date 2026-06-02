import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { summary } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const system = `You are a meticulous, premium research analyst writing a one-page brief about a user's personal link-saving archive ("Info Trunk"). Write in calm, editorial prose — like The Economist crossed with a private librarian. No marketing fluff, no emojis.

Structure (use markdown headings):
## The Shape of Your Archive
(2-3 sentences identifying the dominant themes you see across tags, domains, and titles.)

## Patterns Worth Noting
(3 bullet points: reading habits, blind spots, surprising clusters.)

## Quiet Recommendations
(3 bullet points: what to revisit, what to archive, what to read next from their own queue.)

Keep total length under 280 words. Reference specific tags or domains from the data. Use **bold** for key themes and *italics* sparingly.`;

    const userMsg = `Here is the user's archive summary as JSON:\n\n${JSON.stringify(summary, null, 2)}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limits exceeded, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Lovable Cloud settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Analyst unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const brief = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ brief }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("analyst-brief error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});