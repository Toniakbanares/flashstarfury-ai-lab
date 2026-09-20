import { streamChat, generateImage } from "@/lib/ai";

export class AiError extends Error {}

function friendly(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("429") || m.includes("rate")) return "Muitas requisições agora. Aguarde alguns segundos e tente de novo.";
  if (m.includes("402") || m.includes("credit")) return "Os créditos de IA acabaram. Tente novamente mais tarde.";
  if (m.includes("failed to fetch") || m.includes("network") || m.includes("conexão")) return "Falha de conexão. Verifique sua internet e tente novamente.";
  if (m.includes("503") || m.includes("unavailable")) return "Os provedores de IA estão indisponíveis no momento. Tente em instantes.";
  return raw || "Não foi possível gerar agora. Tente novamente.";
}

function isRetryable(raw: string): boolean {
  return /429|rate|500|502|503|504|temporar|unavailable|network|conexão|failed to fetch/i.test(raw);
}

function once(system: string, userPrompt: string, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    let acc = "";
    streamChat({
      messages: [{ role: "user", content: `${system}\n\n${userPrompt}` }],
      mode: "creative",
      signal,
      onDelta: (d) => (acc += d),
      onDone: () => (acc.trim() ? resolve(acc.trim()) : reject(new AiError("Resposta vazia"))),
      onError: (e) => reject(new AiError(e)),
    });
  });
}

/**
 * Ask the AI with retry + free fallback provider and friendly error messages.
 */
export async function askAI(
  system: string,
  userPrompt: string,
  signal?: AbortSignal,
  onChunkless?: (info: string) => void,
): Promise<string> {
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await once(system, userPrompt, signal);
    } catch (e) {
      if (signal?.aborted) throw new AiError("Geração cancelada.");
      lastErr = e instanceof Error ? e.message : String(e);
      if (!isRetryable(lastErr)) break;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 900));
    }
  }
  onChunkless?.("A geração não pôde ser concluída.");
  throw new AiError(friendly(lastErr));
}

/** Streaming variant so the user sees the song being written live. */
export async function askAIStream(
  system: string,
  userPrompt: string,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  try {
    return await new Promise<string>((resolve, reject) => {
      let acc = "";
      streamChat({
        messages: [{ role: "user", content: `${system}\n\n${userPrompt}` }],
        mode: "creative",
        signal,
        onDelta: (d) => { acc += d; onDelta(acc); },
        onDone: () => (acc.trim() ? resolve(acc.trim()) : reject(new AiError("Resposta vazia"))),
        onError: (e) => reject(new AiError(e)),
      });
    });
  } catch (e) {
    if (signal?.aborted) throw new AiError("Geração cancelada.");
    const out = await askAI(system, userPrompt, signal);
    onDelta(out);
    return out;
  }
}

export async function generateCover(prompt: string) {
  try {
    const res = await generateImage(prompt);
    if (res?.error) throw new AiError(friendly(res.error));
    return res;
  } catch (e) {
    throw new AiError(friendly(e instanceof Error ? e.message : ""));
  }
}
