// Transcribe audio via Lovable AI Gateway (OpenAI-compatible STT).
// Falls back to a mock transcript if LOVABLE_API_KEY is missing.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const key = Deno.env.get("LOVABLE_API_KEY");
    const inbound = await req.formData();
    const file = inbound.get("file");

    if (!(file instanceof File)) {
      return json({ error: "Missing 'file' in multipart body" }, 400);
    }

    if (!key) {
      // Mock fallback so the UI keeps working with no key set.
      return json({
        text: `[Mock transcript — no LOVABLE_API_KEY configured]\nUploaded: ${file.name} (${Math.round(file.size / 1024)} KB)\n\nExample lyrics:\nVerse 1: Neon lights across the sky\nChorus: We rise, we rise, we rise tonight`,
        mock: true,
      }, 200);
    }

    const fd = new FormData();
    fd.append("file", file, file.name || "audio.webm");
    fd.append("model", "openai/gpt-4o-transcribe");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
      if (upstream.status === 429) return json({ error: "Rate limit exceeded. Please try again shortly." }, 429);
      if (upstream.status === 402) return json({ error: "AI credits exhausted. Please add credits." }, 402);
      return json({ error: `Transcription failed (${upstream.status})`, detail }, upstream.status);
    }

    const data = await upstream.json();
    return json({ text: data.text ?? "", mock: false }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
