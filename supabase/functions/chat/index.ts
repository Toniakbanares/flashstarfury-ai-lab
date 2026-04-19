import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();

    const ATLAS_KEY = Deno.env.get("ATLASCLOUD_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_AI_KEY = Deno.env.get("GOOGLE_AI_KEY");

    let systemPrompt = "Você é o Lumy, assistente de IA do Flash Star Fury. Responda em português brasileiro de forma amigável, clara e útil. Use emojis quando apropriado e formate respostas com markdown.";
    if (mode === "creative") {
      systemPrompt = "Você é o Lumy, assistente criativo do Flash Star Fury. Especialista em escrita criativa, poemas, roteiros, código e conteúdo criativo. Responda em português brasileiro com markdown.";
    } else if (mode === "code") {
      systemPrompt = "Você é o Lumy Coder, assistente de programação do Flash Star Fury powered by KAT Coder. Especialista em código, debug, arquitetura e melhores práticas. Sempre use blocos de código markdown com linguagem especificada. Responda em português brasileiro.";
    } else if (mode === "search") {
      systemPrompt = "Você é o Lumy, assistente de busca do Flash Star Fury. Forneça informações detalhadas, precisas e bem estruturadas em markdown. Responda em português brasileiro.";
    }

    // Helper: tentar AtlasCloud (KAT Coder)
    const tryAtlas = async () => {
      if (!ATLAS_KEY) return null;
      try {
        const r = await fetch("https://api.atlascloud.ai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${ATLAS_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "kwaipilot/kat-coder-exp-72b-1010",
            messages: [{ role: "system", content: systemPrompt }, ...messages],
            stream: true,
            max_tokens: 2048,
            temperature: mode === "code" ? 0.3 : 0.7,
          }),
        });
        if (r.ok && r.body) return r;
        console.error("AtlasCloud error:", r.status, await r.text());
      } catch (e) { console.error("AtlasCloud exception:", e); }
      return null;
    };

    // Helper: tentar Google AI direto (transformar SSE)
    const tryGoogle = async () => {
      if (!GOOGLE_AI_KEY) return null;
      try {
        const geminiMessages = messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:streamGenerateContent?alt=sse&key=${GOOGLE_AI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: geminiMessages,
              generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
            }),
          }
        );
        if (!r.ok) { console.error("Google AI error:", r.status, await r.text()); return null; }
        const reader = r.body!.getReader();
        const decoder = new TextDecoder();
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) { controller.enqueue(encoder.encode("data: [DONE]\n\n")); controller.close(); break; }
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\n`));
                } catch { /* skip */ }
              }
            }
          },
        });
        return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      } catch (e) { console.error("Google exception:", e); return null; }
    };

    // Helper: tentar Lovable AI
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
      } catch (e) { console.error("Lovable exception:", e); }
      return null;
    };

    // Ordem: code -> Atlas, Google, Lovable. Outros -> Atlas, Google, Lovable
    const providers = mode === "code"
      ? [tryAtlas, tryGoogle, tryLovable]
      : [tryAtlas, tryGoogle, tryLovable];

    for (const p of providers) {
      const resp = await p();
      if (resp) {
        if (resp instanceof Response) return resp;
        return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
      }
    }

    return new Response(JSON.stringify({ error: "Todos os provedores de IA falharam. Tente novamente em instantes." }), {
      status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
