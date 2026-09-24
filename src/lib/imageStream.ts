import { createParser } from "eventsource-parser";

type ImagePayload = {
  type?: string;
  b64_json?: string;
  error?: { message?: string };
};

export type ImageStreamInput = {
  prompt: string;
  aspect?: string;
  quality?: number;
  mode?: string;
};

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export async function streamGeneratedImage(
  input: ImageStreamInput,
  onFrame?: (dataUrl: string, isFinal: boolean) => void,
): Promise<string> {
  const endpoint = `${URL}/functions/v1/generate-image`;
  const send = (stream: boolean) =>
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({ ...input, stream }),
    });

  const response = await send(true);
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data?.error || `Falha na geração (${response.status})`);
    Object.assign(error, { status: response.status });
    throw error;
  }

  let finalUrl = "";
  let sawAnyEvent = false;
  let sawCompleted = false;
  let streamError = "";
  const parser = createParser({
    onEvent(event) {
      let payload: ImagePayload | undefined;
      try {
        payload = JSON.parse(event.data) as ImagePayload;
      } catch {
        payload = undefined;
      }
      if (event.event === "error" || payload?.type === "error") {
        sawAnyEvent = true;
        streamError = payload?.error?.message || "A geração da imagem falhou.";
        return;
      }
      const type = event.event || payload?.type;
      if (type !== "image_generation.partial_image" && type !== "image_generation.completed") return;
      sawAnyEvent = true;
      if (!payload?.b64_json) {
        streamError = "O gerador retornou um quadro vazio.";
        return;
      }
      const url = `data:image/png;base64,${payload.b64_json}`;
      const isFinal = type === "image_generation.completed";
      finalUrl = url;
      onFrame?.(url, isFinal);
      if (isFinal) sawCompleted = true;
    },
  });

  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } catch (error) {
    if (sawAnyEvent) throw error;
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  if (streamError) throw new Error(streamError);
  if (sawAnyEvent && !sawCompleted) throw new Error("A geração terminou antes de concluir a imagem.");
  if (sawCompleted && finalUrl) return finalUrl;

  // A stream with no events may be replayed once without streaming.
  const replay = await send(false);
  const data = await replay.json().catch(() => ({}));
  if (!replay.ok) {
    const error = new Error(data?.error || `Falha na geração (${replay.status})`);
    Object.assign(error, { status: replay.status });
    throw error;
  }
  const url = data?.imageUrl || (data?.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : "");
  if (!url) throw new Error("O gerador não retornou uma imagem.");
  onFrame?.(url, true);
  return url;
}