// Thin client for our Edge Functions (image / video / 3d / text).
// All return { ok, data, fallback } so the UI can fall back to local providers.
const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function call<T = any>(fn: string, body: any): Promise<{ ok: boolean; data?: T; fallback?: boolean; error?: string }> {
  try {
    const r = await fetch(`${URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data?.error || `HTTP ${r.status}` };
    if (data?.fallback) return { ok: false, fallback: true, error: data?.error };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network" };
  }
}

export const generateImageServer = (prompt: string) =>
  call<{ imageUrl: string; text?: string }>("generate-image", { prompt });

export const generateVideoServer = (prompt: string) =>
  call<{ videoUrl: string }>("generate-video", { prompt });

export const generate3DServer = (prompt: string) =>
  call<{ modelUrl: string; previewUrl?: string }>("generate-3d", { prompt });
