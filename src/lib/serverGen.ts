// Thin client for our Edge Functions (image / video / 3d / text).
// All return a status-aware result so callers never retry terminal AI failures.
import { streamGeneratedImage } from "@/lib/imageStream";
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export type GenerationResult<T> = {
  ok: boolean;
  data?: T;
  fallback?: boolean;
  error?: string;
  status?: number;
  retryable?: boolean;
};

async function call<T = unknown>(fn: string, body: unknown): Promise<GenerationResult<T>> {
  try {
    const r = await fetch(`${URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    const retryable = r.status === 429 || r.status >= 500;
    if (!r.ok) return { ok: false, error: data?.error || `HTTP ${r.status}`, status: r.status, retryable };
    if (data?.fallback) return { ok: false, fallback: true, error: data?.error, status: data?.status, retryable: data?.retryable };
    return { ok: true, data, status: r.status, retryable: false };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network" };
  }
}

export async function generateImageServer(
  prompt: string,
  aspect = "1:1",
  quality = 80,
  mode = "image",
  onFrame?: (imageUrl: string, isFinal: boolean) => void,
): Promise<GenerationResult<{ imageUrl: string }>> {
  try {
    const imageUrl = await streamGeneratedImage({ prompt, aspect, quality, mode }, onFrame);
    return { ok: true, data: { imageUrl }, status: 200, retryable: false };
  } catch (error) {
    const status = typeof (error as { status?: unknown })?.status === "number"
      ? (error as { status: number }).status
      : undefined;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Falha na geração da imagem.",
      status,
      retryable: status === 429 || (typeof status === "number" && status >= 500),
    };
  }
}

export const generateVideoServer = (prompt: string) =>
  call<{ videoUrl: string }>("generate-video", { prompt });

export const generate3DServer = (prompt: string) =>
  call<{ modelUrl: string; previewUrl?: string }>("generate-3d", { prompt });
