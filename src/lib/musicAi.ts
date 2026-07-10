import { streamChat, generateImage } from "@/lib/ai";

export async function askAI(system: string, userPrompt: string, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    let acc = "";
    streamChat({
      messages: [
        { role: "user", content: `${system}\n\n${userPrompt}` } as any,
      ],
      signal,
      onDelta: (d) => (acc += d),
      onDone: () => resolve(acc.trim()),
      onError: (e) => reject(new Error(e)),
    });
  });
}

export async function generateCover(prompt: string) {
  return generateImage(prompt);
}
