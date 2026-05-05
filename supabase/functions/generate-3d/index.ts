import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// FAL Trellis: text → 3D model (.glb) via image intermediate
async function falThreeD(prompt: string, key: string): Promise<{ modelUrl: string; previewUrl?: string } | null> {
  try {
    // 1) text → image (flux schnell)
    const imgRes = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, image_size: "square_hd", num_inference_steps: 4 }),
    });
    if (!imgRes.ok) { console.error("FAL flux failed:", imgRes.status); return null; }
    const imgData = await imgRes.json();
    const imageUrl = imgData?.images?.[0]?.url;
    if (!imageUrl) return null;

    // 2) image → 3D (trellis, queued)
    const submit = await fetch("https://queue.fal.run/fal-ai/trellis", {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    if (!submit.ok) { console.error("FAL trellis submit failed:", submit.status); return { modelUrl: "", previewUrl: imageUrl }; }
    const { request_id, status_url, response_url } = await submit.json();
    if (!request_id) return { modelUrl: "", previewUrl: imageUrl };

    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3000));
      const st = await fetch(status_url, { headers: { Authorization: `Key ${key}` } });
      const sj = await st.json().catch(() => ({}));
      if (sj.status === "COMPLETED") {
        const res = await fetch(response_url, { headers: { Authorization: `Key ${key}` } });
        const data = await res.json();
        const modelUrl = data?.model_mesh?.url || data?.model?.url;
        return { modelUrl: modelUrl || "", previewUrl: imageUrl };
      }
      if (sj.status === "FAILED") return { modelUrl: "", previewUrl: imageUrl };
    }
    return { modelUrl: "", previewUrl: imageUrl };
  } catch (e) {
    console.error("FAL 3D exception:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string" || prompt.length > 1000) {
      return new Response(JSON.stringify({ error: "Prompt inválido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FAL_API_KEY = Deno.env.get("FAL_API_KEY");
    if (FAL_API_KEY) {
      const r = await falThreeD(prompt, FAL_API_KEY);
      if (r) {
        return new Response(JSON.stringify({ ...r, provider: "fal" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ fallback: true, error: "Provedor 3D indisponível" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
