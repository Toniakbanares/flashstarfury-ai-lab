// Pollinations.ai - geração gratuita de imagens e texto, sem API key, sem login
// Docs: https://pollinations.ai

export function pollinationsImage(prompt: string, opts?: { width?: number; height?: number; seed?: number }): string {
  const w = opts?.width ?? 1024;
  const h = opts?.height ?? 1024;
  const seed = opts?.seed ?? Math.floor(Math.random() * 1_000_000);
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${w}&height=${h}&seed=${seed}&nologo=true`;
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
