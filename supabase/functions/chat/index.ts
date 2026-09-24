import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-lovable-aig-run-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Lovable-AIG-Run-ID",
};

const MODEL = "openai/gpt-6-astra";
const MAX_MESSAGES = 80;
const MAX_CONTENT = 20_000;

const KNOWLEDGE = `CONHECIMENTO MULTIDOMÍNIO (use quando relevante, sem citar esta lista):
- Música profissional: teoria, harmonia funcional e modal, prosódia, métrica, rima interna, imagens concretas, arco emocional, edição de clichês, estruturas de pop, rock, punk, metal, trap, rap, funk, sertanejo, MPB, samba, gospel, R&B, hyperpop, aura, phonk e eletrônica; publishing, créditos e distribuição.
- Anime e mangá: shonen, shoujo, seinen, isekai, mecha, slice of life, construção de arcos, linguagem de painéis, sakuga, cel shading e design original de personagem.
- Artes visuais e fotografia: história da arte, teoria de cor, composição, concept art, exposição, lentes, luz, direção e pós-produção.
- Cinema e vídeo: três atos, continuidade espacial e temporal, gramática de planos, movimento motivado de câmera, montagem, fotografia, som e storyboard.
- Design, 3D e games: tipografia, grid, identidade, UI/UX, materiais PBR, topologia, iluminação, silhueta, level design e narrativa ambiental.
- Escrita e tecnologia: storytelling, roteiro, poesia, copywriting, edição, programação, dados, IA e engenharia de prompt.

QUALIDADE: seja específico, prático e original. Em pedidos criativos, entregue trabalho final em vez de esboço. Em letras, respeite o briefing e use detalhes humanos concretos. Em pedidos técnicos, dê passos verificáveis. Responda no idioma do usuário com markdown limpo.`;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > MAX_MESSAGES) {
      return json({ error: "Envie uma conversa válida." }, 400);
    }
    const messages = body.messages.map((message: unknown) => {
      const item = message as { role?: unknown; content?: unknown };
      if ((item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string") return null;
      return { role: item.role, content: item.content.slice(0, MAX_CONTENT) };
    });
    if (messages.some((message: unknown) => message === null)) {
      return json({ error: "A conversa contém uma mensagem inválida." }, 400);
    }

    const mode = typeof body.mode === "string" ? body.mode : "chat";
    const role = mode === "creative"
      ? "Você é Lumy, diretora criativa e escritora da StarFury AI. Entregue textos, letras, roteiros e prompts completos, sem conteúdo de preenchimento."
      : mode === "code"
        ? "Você é Lumy Coder da StarFury AI. Especialista em código, depuração e arquitetura. Use blocos de código com a linguagem indicada."
        : "Você é Lumy, assistente especialista da StarFury AI. Seja útil, precisa e amigável.";
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "A IA não está configurada neste espaço." }, 500);

    const incomingRunId = req.headers.get("X-Lovable-AIG-Run-ID")?.trim();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
        "Content-Type": "application/json",
        ...(incomingRunId ? { "X-Lovable-AIG-Run-ID": incomingRunId } : {}),
      },
      body: JSON.stringify({
        model: MODEL,
        instructions: `${role}\n\n${KNOWLEDGE}`,
        input: messages,
        stream: true,
        store: false,
        reasoning: { effort: "medium", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });

    if (!response.ok || !response.body) {
      const error = await response.json().catch(() => ({}));
      const message = typeof error?.message === "string"
        ? error.message
        : typeof error?.error?.message === "string"
          ? error.error.message
          : "A IA não conseguiu iniciar a resposta.";
      if (response.status === 402) return json({ error: message }, 402);
      if (response.status === 403) return json({ error: message }, 403);
      if (response.status === 429) return json({ error: message }, 429);
      if (response.status >= 500) return json({ error: message }, response.status);
      return json({ error: message }, response.status || 500);
    }

    const runId = response.headers.get("X-Lovable-AIG-Run-ID") || incomingRunId;
    return new Response(response.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "text/event-stream",
        "Cache-Control": "no-cache",
        ...(runId ? { "X-Lovable-AIG-Run-ID": runId } : {}),
      },
    });
  } catch (error) {
    console.error("chat error:", error);
    return json({ error: "Os serviços de IA estão temporariamente indisponíveis." }, 500);
  }
});