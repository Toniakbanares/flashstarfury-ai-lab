import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_MODEL = "openai/gpt-image-2.5-sunburst";
const ALLOWED_ASPECTS = new Set(["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"]);
const ALLOWED_MODES = new Set(["image", "video", "3d", "avatar", "logo", "cover"]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const sizeFor = (aspect: string) => {
  if (aspect === "16:9" || aspect === "4:3" || aspect === "21:9") return "1536x1024";
  if (aspect === "9:16" || aspect === "3:4") return "1024x1536";
  return "1024x1024";
};

const falSizeFor = (aspect: string) => {
  if (aspect === "16:9" || aspect === "21:9") return "landscape_16_9";
  if (aspect === "9:16") return "portrait_16_9";
  if (aspect === "4:3") return "landscape_4_3";
  if (aspect === "3:4") return "portrait_4_3";
  return "square_hd";
};

const modeDirection: Record<string, string> = {
  image: "Create a polished final artwork with a clear focal hierarchy and intentional composition.",
  video: "Create a cinematic keyframe with temporal continuity, believable motion setup, clean edges, and stable character identity.",
  "3d": "Show one complete object, centered and fully visible, with coherent geometry, clean silhouette, PBR materials, and neutral studio lighting.",
  avatar: "Create one centered head-and-shoulders portrait with accurate facial anatomy, sharp eyes, natural skin texture, and clean background separation.",
  logo: "Create a professional flat vector-style brand mark with simple geometry, strong silhouette, balanced negative space, and transparent background. No mockup.",
  cover: "Create iconic square album artwork with one strong focal concept, premium art direction, print-ready detail, and intentional negative space.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    const prompt = body?.prompt;
    if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 1500) {
      return json({ error: "Descreva a imagem em até 1500 caracteres." }, 400);
    }

    const aspect = typeof body?.aspect === "string" && ALLOWED_ASPECTS.has(body.aspect) ? body.aspect : "1:1";
    const mode = typeof body?.mode === "string" && ALLOWED_MODES.has(body.mode) ? body.mode : "image";
    const requestedQuality = typeof body?.quality === "number" ? Math.max(0, Math.min(100, body.quality)) : 80;
    const quality = requestedQuality >= 90 ? "max" : requestedQuality >= 70 ? "high" : "medium";
    const refined = [
      prompt.trim(),
      modeDirection[mode],
      `Compose specifically for a ${aspect} canvas; use the full frame without borders or letterboxing.`,
      "Professional art direction, coherent anatomy and perspective, crisp subject detail, controlled contrast, natural color separation.",
      "Do not include any watermark, stock mark, platform logo, artist signature, UI, caption, text overlay, border, or frame.",
    ].join("\n\n");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let lastStatus = 503;
    let lastMessage = "O gerador de imagens está temporariamente indisponível.";

    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: {
            "Lovable-API-Key": LOVABLE_API_KEY,
            "X-Lovable-AIG-SDK": "fetch",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: IMAGE_MODEL,
            prompt: refined,
            size: sizeFor(aspect),
            quality,
            output_format: "png",
            ...(mode === "logo" ? { background: "transparent" } : { background: "opaque" }),
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const b64 = data?.data?.[0]?.b64_json;
          if (typeof b64 === "string" && b64.length > 100) {
            return json({ imageUrl: `data:image/png;base64,${b64}`, provider: "lovable-ai" });
          }
          lastMessage = "A IA concluiu a geração, mas não retornou uma imagem válida.";
        } else {
          const error = await response.json().catch(() => ({}));
          lastStatus = response.status;
          lastMessage = typeof error?.message === "string"
            ? error.message
            : typeof error?.error?.message === "string"
              ? error.error.message
              : "Falha no gerador principal.";
          console.error("Lovable image failed:", response.status, lastMessage);
        }
      } catch (error) {
        lastStatus = 503;
        lastMessage = error instanceof Error ? error.message : lastMessage;
        console.error("Lovable image exception:", error);
      }
    } else {
      lastStatus = 401;
      lastMessage = "A geração de imagens não está configurada.";
    }

    // Existing secondary provider. A terminal Gateway failure may still be recovered
    // by this independently configured provider, but no marked public fallback is used.
    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (FAL_API_KEY) {
      try {
        const response = await fetch("https://fal.run/fal-ai/flux/dev", {
          method: "POST",
          headers: { Authorization: `Key ${FAL_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: refined,
            image_size: falSizeFor(aspect),
            num_inference_steps: requestedQuality >= 85 ? 36 : 28,
            guidance_scale: 3.5,
            enable_safety_checker: true,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          const imageUrl = data?.images?.[0]?.url;
          if (typeof imageUrl === "string" && imageUrl.startsWith("https://")) {
            return json({ imageUrl, provider: "fal" });
          }
        } else {
          console.error("FAL image failed:", response.status, await response.text());
        }
      } catch (error) {
        console.error("FAL image exception:", error);
      }
    }

    const safeMessage = lastStatus === 402
      ? "Os créditos de IA do espaço acabaram. Adicione créditos para continuar gerando imagens sem marca d'água."
      : lastStatus === 403
        ? lastMessage
        : lastStatus === 429
          ? "Muitas imagens estão sendo geradas agora. Aguarde um pouco e tente novamente."
          : lastStatus === 401
            ? lastMessage
            : "Os geradores de imagem estão temporariamente indisponíveis. Tente novamente em instantes.";
    return json({ error: safeMessage, retryable: lastStatus === 429 || lastStatus >= 500 }, lastStatus);
  } catch (error) {
    console.error("Image generation error:", error);
    return json({ error: "Não foi possível processar a solicitação de imagem." }, 500);
  }
});