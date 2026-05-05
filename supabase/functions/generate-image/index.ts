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
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");

    // 0) FAL Flux Schnell (preferred when key exists — fast and high quality)
    if (FAL_API_KEY) {
      try {
        const r = await fetch("https://fal.run/fal-ai/flux/schnell", {
          method: "POST",
          headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, image_size: "square_hd", num_inference_steps: 4 }),
        });
        if (r.ok) {
          const d = await r.json();
          const url = d?.images?.[0]?.url;
          if (url) {
            return new Response(JSON.stringify({ imageUrl: url, text: "Imagem gerada (FAL) ✨", provider: "fal" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        } else {
          console.error("FAL image failed:", r.status, await r.text());
        }
      } catch (e) { console.error("FAL exception:", e); }
    }

    // 1) Google Gemini direto (modelo atual de geração de imagem)
    if (GOOGLE_AI_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GOOGLE_AI_KEY}`,
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

    // Retorna 200 com erro + fallback:true para o cliente acionar Puter.js
    return new Response(JSON.stringify({ error: "Provedores de imagem indisponíveis. Usando fallback.", fallback: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("image gen error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
