import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 1000) {
      return new Response(JSON.stringify({ error: "Prompt inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_AI_KEY = Deno.env.get("GOOGLE_AI_KEY");

    // 1) Google Gemini direto (free tier - tenta primeiro pra economizar Lovable)
    if (GOOGLE_AI_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_AI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          let imageUrl = "";
          let text = "";
          for (const part of parts) {
            if (part.inlineData) imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            if (part.text) text = part.text;
          }
          if (imageUrl) {
            return new Response(JSON.stringify({ imageUrl, text: text || "Imagem gerada! ✨" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          console.error("Google image error:", response.status, await response.text());
        }
      } catch (e) { console.error("Google exception:", e); }
    }

    // 2) Lovable AI Nano Banana (fallback)
    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: `Generate a high quality detailed image: ${prompt}` }],
            modalities: ["image", "text"],
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          const text = data.choices?.[0]?.message?.content || "Imagem gerada! ✨";
          if (imageUrl) {
            return new Response(JSON.stringify({ imageUrl, text }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          console.error("Lovable image error:", response.status, await response.text());
        }
      } catch (e) { console.error("Lovable exception:", e); }
    }

    return new Response(JSON.stringify({ error: "Não foi possível gerar a imagem. Provedores indisponíveis." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("image gen error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
