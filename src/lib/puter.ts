// Puter.js fallback client - free AI without API keys (user signs into Puter on first use)
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string | any[], opts?: any) => Promise<any>;
        txt2img: (prompt: string) => Promise<HTMLImageElement>;
      };
    };
  }
}

export const isPuterReady = () => typeof window !== "undefined" && !!window.puter?.ai;

export async function puterChat(prompt: string, system?: string): Promise<string> {
  if (!isPuterReady()) throw new Error("Puter não disponível");
  const messages = system
    ? [{ role: "system", content: system }, { role: "user", content: prompt }]
    : prompt;
  const res = await window.puter!.ai.chat(messages as any, { model: "gpt-5-nano" });
  if (typeof res === "string") return res;
  return res?.message?.content || res?.text || String(res);
}

export async function puterImage(prompt: string): Promise<string> {
  if (!isPuterReady()) throw new Error("Puter não disponível");
  const img = await window.puter!.ai.txt2img(prompt);
  return img.src;
}
