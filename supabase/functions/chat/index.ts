import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curated, current top-tier models exposed via OpenRouter.
// Keep this list short and high-quality only — no legacy / low-quality models.
const ALLOWED_MODELS = new Set<string>([
  "anthropic/claude-3.5-sonnet",
  "openai/gpt-4o",
  "openai/gpt-4o-mini",
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "deepseek/deepseek-chat",
  "mistralai/mistral-large",
]);

const DEFAULT_MODEL = "google/gemini-2.5-flash";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, model } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    let systemPrompt =
      "You are Lumy, the AI assistant of StarFury AI. Be helpful, concise, and friendly. Use clean markdown formatting. Reply in the user's language.";
    if (mode === "creative") {
      systemPrompt =
        "You are Lumy, the creative writer of StarFury AI. Specialize in copy, scripts, hooks, and structured creative drafts. Use clean markdown.";
    } else if (mode === "code") {
      systemPrompt =
        "You are Lumy Coder of StarFury AI. Specialist in code, debugging, and architecture. Always wrap code in fenced markdown blocks with the language tag.";
    }

    const chosenModel = ALLOWED_MODELS.has(model) ? model : DEFAULT_MODEL;

    // 1) Primary: OpenRouter
    const tryOpenRouter = async () => {
      if (!OPENROUTER_API_KEY) return null;
      try {
        const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pixelnova.lovable.app",
            "X-Title": "StarFury AI",
          },
          body: JSON.stringify({
            model: chosenModel,
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            stream: true,
            temperature: mode === "code" ? 0.3 : 0.7,
          }),
        });
        if (r.ok && r.body) return r;
        console.error("OpenRouter error:", r.status, await r.text().catch(() => ""));
      } catch (e) {
        console.error("OpenRouter exception:", e);
      }
      return null;
    };

    // 2) Fallback: Lovable AI Gateway
    const tryLovable = async () => {
      if (!LOVABLE_API_KEY) return null;
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            stream: true,
          }),
        });
        if (r.ok && r.body) return r;
        console.error("Lovable error:", r.status);
      } catch (e) {
        console.error("Lovable exception:", e);
      }
      return null;
    };

    for (const p of [tryOpenRouter, tryLovable]) {
      const resp = await p();
      if (resp) {
        return new Response(resp.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
    }

    return new Response(
      JSON.stringify({ error: "All AI providers are temporarily unavailable. Please try again shortly." }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
