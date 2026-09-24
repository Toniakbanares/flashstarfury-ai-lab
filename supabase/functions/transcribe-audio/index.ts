// Transcribe audio via Lovable AI Gateway without fabricated fallback text.
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

    if (!key) return json({ error: "A transcrição de áudio não está configurada." }, 500);

    const fd = new FormData();
    fd.append("file", file, file.name || "audio.webm");
    fd.append("model", "google/gemini-3.5-transcribe");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: fd,
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => "");
       const safe = detail ? (() => {
         try {
           const parsed = JSON.parse(detail);
           return parsed?.message || parsed?.error?.message;
         } catch { return undefined; }
       })() : undefined;
       if (upstream.status === 429) return json({ error: safe || "Muitas transcrições agora. Aguarde e tente novamente." }, 429);
       if (upstream.status === 402 || upstream.status === 403) return json({ error: safe || "A transcrição está bloqueada no momento." }, upstream.status);
       return json({ error: safe || `A transcrição falhou (${upstream.status}).` }, upstream.status);
    }

    const data = await upstream.json();
    if (typeof data.text !== "string" || !data.text.trim()) return json({ error: "Nenhuma fala foi identificada no áudio." }, 422);
    return json({ text: data.text }, 200);
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
