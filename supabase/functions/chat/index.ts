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

// Models supported by the Lovable AI Gateway (used as the reliable fallback).
const GATEWAY_MODEL: Record<string, string> = {
  "anthropic/claude-3.5-sonnet": "openai/gpt-5.4",
  "openai/gpt-4o": "openai/gpt-5.4",
  "openai/gpt-4o-mini": "openai/gpt-5.4-mini",
  "google/gemini-2.5-flash": "google/gemini-3.8-flash",
  "google/gemini-2.5-pro": "google/gemini-3.1-pro-preview",
  "deepseek/deepseek-chat": "google/gemini-3.8-flash",
  "mistralai/mistral-large": "google/gemini-3.8-flash",
};


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

    let lastStatus = 0;
    let lastError = "";

    // 1) Primary: Lovable AI Gateway (always available, no external credits)
    const tryLovable = async () => {
      if (!LOVABLE_API_KEY) return null;
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: GATEWAY_MODEL[chosenModel] ?? "google/gemini-3.8-flash",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            stream: true,
          }),
        });
        if (r.ok && r.body) return r;
        lastStatus = r.status;
        lastError = await r.text().catch(() => "");
        console.error("Lovable error:", r.status, lastError);
      } catch (e) {
        console.error("Lovable exception:", e);
      }
      return null;
    };

    // 2) Fallback: OpenRouter (only if the account still has credits)
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
            // Keep the reservation small so it fits limited OpenRouter balances
            // (OpenRouter reserves the model's full context otherwise → 402).
            max_tokens: 2048,
            temperature: mode === "code" ? 0.3 : 0.7,
          }),
        });
        if (r.ok && r.body) return r;
        lastStatus = r.status;
        lastError = await r.text().catch(() => "");
        console.error("OpenRouter error:", r.status, lastError);
      } catch (e) {
        console.error("OpenRouter exception:", e);
      }
      return null;
    };

    for (const p of [tryLovable, tryOpenRouter]) {
      const resp = await p();
      if (resp) {
        return new Response(resp.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }
    }

    const friendly =
      lastStatus === 402
        ? "Sem créditos de IA disponíveis no momento. Adicione créditos para continuar usando o chat."
        : lastStatus === 429
          ? "Muitas solicitações agora. Aguarde alguns segundos e tente novamente."
          : "Os serviços de IA estão temporariamente indisponíveis. Tente novamente em instantes.";

    return new Response(JSON.stringify({ error: friendly, detail: lastError.slice(0, 300) }), {
      status: lastStatus === 402 || lastStatus === 429 ? lastStatus : 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
