import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// FAL queue API: submit job → poll until completed → return video URL
async function falVideo(prompt: string, key: string): Promise<{ videoUrl: string } | null> {
  const model = "fal-ai/wan/v2.2-5b/text-to-video";
  try {
    const submit = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, num_frames: 81, resolution: "480p" }),
    });
    if (!submit.ok) {
      console.error("FAL submit failed:", submit.status, await submit.text());
      return null;
    }
    const { request_id, status_url, response_url } = await submit.json();
    if (!request_id) return null;

    // Poll up to 90s
    const deadline = Date.now() + 90_000;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3000));
      const st = await fetch(status_url, { headers: { Authorization: `Key ${key}` } });
      const sj = await st.json().catch(() => ({}));
      if (sj.status === "COMPLETED") {
        const res = await fetch(response_url, { headers: { Authorization: `Key ${key}` } });
        const data = await res.json();
        const url = data?.video?.url || data?.output?.url;
        if (url) return { videoUrl: url };
        return null;
      }
      if (sj.status === "FAILED") return null;
    }
    return null;
  } catch (e) {
    console.error("FAL video exception:", e);
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
      const r = await falVideo(prompt, FAL_API_KEY);
      if (r?.videoUrl) {
        return new Response(JSON.stringify({ videoUrl: r.videoUrl, provider: "fal" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Signal client to use local fallback (canvas + MediaRecorder)
    return new Response(JSON.stringify({ fallback: true, error: "Provedor de vídeo indisponível" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
