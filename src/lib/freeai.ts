// Pollinations.ai — used only as last-resort poster/preview generator.
// Trimmed to top-quality models only.
export const POLLINATIONS_MODELS = [
  { id: "flux", name: "Flux" },
  { id: "flux-realism", name: "Flux Realism" },
  { id: "flux-3d", name: "Flux 3D" },
] as const;

export const ASPECT_RATIOS = [
  { id: "1:1", name: "Square (1:1)", w: 1024, h: 1024 },
  { id: "16:9", name: "Landscape (16:9)", w: 1280, h: 720 },
  { id: "9:16", name: "Portrait (9:16)", w: 720, h: 1280 },
  { id: "4:3", name: "Classic (4:3)", w: 1024, h: 768 },
  { id: "3:4", name: "Vertical (3:4)", w: 768, h: 1024 },
  { id: "21:9", name: "Cinema (21:9)", w: 1536, h: 640 },
] as const;

export type PollinationsOpts = {
  width?: number;
  height?: number;
  seed?: number;
  model?: string;
  enhance?: boolean;
};

export function pollinationsImage(prompt: string, opts: PollinationsOpts = {}): string {
  const w = opts.width ?? 1024;
  const h = opts.height ?? 1024;
  const seed = opts.seed ?? Math.floor(Math.random() * 1_000_000);
  const model = opts.model ?? "flux";
  const enhance = opts.enhance ? "&enhance=true" : "";
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&model=${model}&nologo=true${enhance}`;
}

export async function pollinationsText(prompt: string, system?: string): Promise<string> {
  const messages = [
    ...(system ? [{ role: "system", content: system }] : []),
    { role: "user", content: prompt },
  ];
  const resp = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai", messages, private: true }),
  });
  if (!resp.ok) throw new Error(`Pollinations error ${resp.status}`);
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
}

export function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
