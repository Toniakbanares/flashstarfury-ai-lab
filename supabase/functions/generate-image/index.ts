import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Primary: Lovable AI Gateway (watermark-free, high quality).
// Secondary: FAL Flux, if a key is configured.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, aspect } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 1500) {
      return json({ error: "Invalid prompt" }, 400);
    }

    const ratio = typeof aspect === "string" && /^\d+:\d+$/.test(aspect) ? aspect : "1:1";
    const refined =
      `${prompt}\n\nRender as a single finished image with aspect ratio ${ratio}. ` +
      `Professional quality, sharp focus, rich detail, natural lighting and color. ` +
      `Absolutely no watermark, no logo, no signature, no text overlay, no border or frame.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (LOVABLE_API_KEY) {
      try {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image",
            messages: [{ role: "user", content: refined }],
            modalities: ["image", "text"],
          }),
        });
        if (r.ok) {
          const d = await r.json();
          const b64 = d?.data?.[0]?.b64_json;
          if (b64) {
            return json({
              imageUrl: `data:image/png;base64,${b64}`,
              text: "Image generated",
              provider: "lovable-ai",
            });
          }
          console.error("Gateway returned no image data");
        } else {
          const body = await r.text();
          console.error("Gateway image failed:", r.status, body);
          if (r.status === 402 || r.status === 403) {
            return json({ error: "Créditos de IA indisponíveis no momento.", fallback: true });
          }
        }
      } catch (e) {
        console.error("Gateway exception:", e);
      }
    }

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (FAL_API_KEY) {
      try {
        const r = await fetch("https://fal.run/fal-ai/flux/schnell", {
          method: "POST",
          headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: refined, image_size: "square_hd", num_inference_steps: 4 }),
        });
        if (r.ok) {
          const d = await r.json();
          const url = d?.images?.[0]?.url;
          if (url) return json({ imageUrl: url, text: "Image generated", provider: "fal" });
        } else {
          console.error("FAL image failed:", r.status, await r.text());
        }
      } catch (e) {
        console.error("FAL exception:", e);
      }
    }

    return json({ error: "Image provider unavailable", fallback: true });
  } catch (e) {
    console.error("image gen error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
