import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode } = await req.json();
    
    // Try Lovable AI first, fallback to Google AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_AI_KEY = Deno.env.get("GOOGLE_AI_KEY");
    
    if (!LOVABLE_API_KEY && !GOOGLE_AI_KEY) {
      throw new Error("Nenhuma chave de IA configurada");
    }

    let systemPrompt = "Você é o Lumy, assistente de IA do Flash Star Fury. Responda em português brasileiro de forma amigável, clara e útil. Use emojis quando apropriado.";
    if (mode === "creative") {
      systemPrompt = "Você é o Lumy, assistente criativo do Flash Star Fury. Especialista em escrita criativa, poemas, roteiros, código e conteúdo criativo. Responda em português brasileiro.";
    } else if (mode === "search") {
      systemPrompt = "Você é o Lumy, assistente de busca do Flash Star Fury. Forneça informações detalhadas e precisas. Responda em português brasileiro.";
    }

    // Try Google AI directly (free tier)
    if (GOOGLE_AI_KEY) {
      const geminiMessages = messages.map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GOOGLE_AI_KEY}`,
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

      if (response.ok) {
        // Transform Gemini SSE to OpenAI-compatible SSE
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                break;
              }

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
                  if (text) {
                    const openaiChunk = {
                      choices: [{ delta: { content: text } }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
                  }
                } catch { /* skip malformed */ }
              }
            }
          },
        });

        return new Response(stream, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // If Google fails with 429, return rate limit error
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Aguarde um minuto." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback to Lovable AI
    if (LOVABLE_API_KEY) {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: true,
        }),
      });

      if (response.ok) {
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Erro na IA. Tente novamente." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
