// Free video generation: gera N keyframes via Pollinations e compõe um .webm real
// usando Canvas + MediaRecorder com crossfade + leve zoom (efeito Ken Burns).
// Sem API paga, sem chave. Resultado: Blob de vídeo baixável.

import { pollinationsImage, preloadImage } from "@/lib/freeai";

export type VideoGenOpts = {
  width: number;
  height: number;
  seed: number;
  model?: string;
  enhance?: boolean;
  frames?: number;        // número de keyframes (default 5)
  durationMs?: number;    // duração total (default 5000)
  fps?: number;           // default 30
  onProgress?: (pct: number, stage: string) => void;
};

export type VideoGenResult = {
  blob: Blob;
  url: string;            // object URL
  posterUrl: string;      // primeira imagem como capa
  mime: string;
};

const MOTION_HINTS = [
  "wide establishing shot",
  "slow camera push in",
  "medium shot, slight pan right",
  "close up detail, shallow depth of field",
  "dramatic angle, cinematic lighting",
  "atmospheric haze, lens flare",
];

function pickMime(): string {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  for (const c of candidates) {
    // @ts-ignore
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "video/webm";
}

export async function generateVideo(prompt: string, opts: VideoGenOpts): Promise<VideoGenResult> {
  const W = opts.width;
  const H = opts.height;
  const FPS = opts.fps ?? 30;
  const DUR = opts.durationMs ?? 5000;
  const NFRAMES = Math.max(3, Math.min(8, opts.frames ?? 5));
  const onProgress = opts.onProgress ?? (() => {});

  // 1. Gera URLs dos keyframes com seeds derivadas + dicas de movimento
  onProgress(2, "Preparando cenas...");
  const urls: string[] = [];
  for (let i = 0; i < NFRAMES; i++) {
    const hint = MOTION_HINTS[i % MOTION_HINTS.length];
    const enriched = `${prompt}, ${hint}, cinematic film still, 35mm, color grading`;
    urls.push(
      pollinationsImage(enriched, {
        width: W,
        height: H,
        seed: opts.seed + i * 17,
        model: opts.model ?? "flux",
        enhance: opts.enhance,
      })
    );
  }

  // 2. Preload paralelo com progresso
  const images: HTMLImageElement[] = [];
  let loaded = 0;
  await Promise.all(
    urls.map(
      (u) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            loaded++;
            onProgress(5 + Math.round((loaded / NFRAMES) * 55), `Renderizando cena ${loaded}/${NFRAMES}...`);
            images[urls.indexOf(u)] = img;
            resolve();
          };
          img.onerror = () => reject(new Error(`Falha no frame ${u}`));
          img.src = u;
        })
    )
  );

  // Garante que primeira imagem está pronta para poster
  await preloadImage(urls[0]).catch(() => {});

  // 3. Canvas + MediaRecorder
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  // fundo inicial
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // @ts-ignore
  const stream: MediaStream = canvas.captureStream(FPS);
  const mime = pickMime();
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  recorder.start();

  // 4. Loop de render com crossfade + Ken Burns
  const totalFrames = Math.round((DUR / 1000) * FPS);
  const segFrames = Math.floor(totalFrames / NFRAMES);
  const xfadeFrames = Math.max(4, Math.floor(segFrames * 0.35));

  const drawKenBurns = (img: HTMLImageElement, t: number, alpha: number) => {
    // t in [0,1] dentro do segmento; zoom suave de 1.0 -> 1.08
    const zoom = 1.0 + 0.08 * t;
    const sw = img.width / zoom;
    const sh = img.height / zoom;
    const sx = (img.width - sw) / 2 + (img.width * 0.02 * Math.sin(t * Math.PI));
    const sy = (img.height - sh) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  };

  const frameDelay = 1000 / FPS;
  let frame = 0;
  const startTime = performance.now();

  while (frame < totalFrames) {
    const seg = Math.min(NFRAMES - 1, Math.floor(frame / segFrames));
    const localFrame = frame - seg * segFrames;
    const t = Math.min(1, localFrame / segFrames);
    const cur = images[seg];
    const nxt = images[Math.min(NFRAMES - 1, seg + 1)];

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);

    drawKenBurns(cur, t, 1);

    // crossfade no fim do segmento
    const intoFade = localFrame - (segFrames - xfadeFrames);
    if (intoFade > 0 && nxt && nxt !== cur) {
      const a = Math.min(1, intoFade / xfadeFrames);
      drawKenBurns(nxt, a * 0.5, a);
    }

    ctx.globalAlpha = 1;

    // espera próximo tick
    const target = startTime + frame * frameDelay;
    const now = performance.now();
    if (target > now) await new Promise((r) => setTimeout(r, target - now));
    if (frame % 6 === 0) {
      onProgress(60 + Math.round((frame / totalFrames) * 35), "Codificando vídeo...");
    }
    frame++;
  }

  recorder.stop();
  await stopped;

  onProgress(98, "Finalizando...");
  const blob = new Blob(chunks, { type: mime });
  const url = URL.createObjectURL(blob);

  return { blob, url, posterUrl: urls[0], mime };
}
