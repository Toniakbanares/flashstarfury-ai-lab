import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Image as ImageIcon, Video, Box, User, Sparkles, Sparkles as LogoIcon, FileText,
  Send, Loader2, Download, Copy, Repeat, Check, Heart, Wand2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import mascotImg from "@/assets/mascot.png";
import { streamChat } from "@/lib/ai";
import { pollinationsImage, pollinationsText, preloadImage, POLLINATIONS_MODELS, ASPECT_RATIOS } from "@/lib/freeai";
import { generateVideo } from "@/lib/freevideo";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { copyToClipboard } from "@/lib/share";
import { addLocalCreation } from "@/lib/localStore";
import PixSupportModal from "@/components/PixSupportModal";

type Mode = "image" | "video" | "3d" | "avatar" | "logo" | "text";

const MODES: { id: Mode; label: string; icon: typeof ImageIcon; hint: string; placeholder: string }[] = [
  { id: "image",  label: "Image",  icon: ImageIcon, hint: "Generate stunning AI images.",            placeholder: "A cosmic fox painted in watercolor, vibrant nebula background..." },
  { id: "video",  label: "Video",  icon: Video,     hint: "Create cinematic video previews.",        placeholder: "Slow drone shot over neon Tokyo at night, rain reflections..." },
  { id: "3d",     label: "3D",     icon: Box,       hint: "Generate rotatable 3D object previews.",  placeholder: "Isometric crystal cube glowing purple, studio lighting..." },
  { id: "avatar", label: "Avatar", icon: User,      hint: "Square AI portraits & avatars.",          placeholder: "Cyberpunk pilot portrait, neon highlights, sharp focus..." },
  { id: "logo",   label: "Logo",   icon: LogoIcon,  hint: "Clean transparent-style logos.",          placeholder: "Minimalist logo for 'Nova', star + abstract spark, vector style..." },
  { id: "text",   label: "Text",   icon: FileText,  hint: "AI-written copy, scripts & ideas.",       placeholder: "Write a viral TikTok hook about productivity..." },
];

// Default aspect ratio per mode
const DEFAULT_RATIO: Record<Mode, string> = {
  image: "1:1", video: "16:9", "3d": "1:1", avatar: "1:1", logo: "1:1", text: "1:1",
};

// Mode → tool_type stored in DB
const TOOL_TYPE: Record<Mode, string> = {
  image: "image", video: "video", "3d": "3d", avatar: "avatar", logo: "logo", text: "text",
};

const PROMPT_BOOSTERS: Record<Mode, (p: string) => string> = {
  image:  p => p,
  video:  p => `cinematic film still, motion blur, dynamic composition, ${p}`,
  "3d":   p => `3D render, isometric, octane render, studio lighting, ${p}`,
  avatar: p => `professional portrait, sharp focus, centered, ${p}`,
  logo:   p => `${p}, vector logo, flat design, on solid white background, minimal, iconic`,
  text:   p => p,
};

const QUICK_SUGGESTIONS: Record<Mode, string[]> = {
  image:  ["cosmic fox in watercolor, nebula background", "cyberpunk Tokyo street, neon rain", "magical forest at sunset, fireflies"],
  video:  ["drone over neon Tokyo at night", "waves crashing on a black sand beach", "spaceship flying through asteroid field"],
  "3d":   ["isometric crystal cube glowing purple", "low-poly mountain landscape", "futuristic helmet, studio lighting"],
  avatar: ["cyberpunk pilot portrait, neon highlights", "fantasy elf warrior, golden hour", "anime hero, vibrant colors"],
  logo:   ["minimalist logo for 'Nova', star + spark", "coffee shop logo, warm tones", "tech startup logo, geometric"],
  text:   ["Write a viral TikTok hook about productivity", "Cold email opening for a SaaS pitch", "3 catchy taglines for an AI app"],
};

// Mock fallbacks when APIs fail
function mockText(prompt: string): string {
  const intro = `# About: ${prompt}\n\n`;
  const body = `Here's a generated draft based on your prompt. While the AI service was unavailable, this placeholder gives you a structure to start from:\n\n- **Hook:** Capture attention in the first sentence about "${prompt}".\n- **Insight:** Share one specific, useful idea.\n- **Action:** End with a clear next step the reader can take today.\n\n_Try again in a moment for a fully AI-written response._`;
  return intro + body;
}

const AILabSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { credits, bonus, useCredit } = useCredits();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState<Mode>("image");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<{ url: string; poster: string; mime: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [lastGenId, setLastGenId] = useState<string | null>(null);
  const [lastLocalId, setLastLocalId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);

  // Controls
  const [imgModel, setImgModel] = useState<string>("flux");
  const [ratio, setRatio] = useState<string>(DEFAULT_RATIO.image);
  const [creativity, setCreativity] = useState<number[]>([70]);
  const [quality, setQuality] = useState<number[]>([80]);
  const [steps, setSteps] = useState<number[]>([30]);
  const [seed, setSeed] = useState<number[]>([Math.floor(Math.random() * 999999)]);

  // Switch mode → reset ratio default + clear output
  useEffect(() => {
    setRatio(DEFAULT_RATIO[mode]);
    setOutput("");
    setGeneratedImage(null);
    if (generatedVideo) URL.revokeObjectURL(generatedVideo.url);
    setGeneratedVideo(null);
    setLastGenId(null);
  }, [mode]);

  // Prefill from query (?tool=image&prompt=...)
  useEffect(() => {
    const t = searchParams.get("tool");
    const p = searchParams.get("prompt");
    if (t && MODES.some(m => m.id === t)) setMode(t as Mode);
    if (p) setInput(p);
  }, []);

  const activeMode = useMemo(() => MODES.find(m => m.id === mode)!, [mode]);
  const activeRatio = useMemo(
    () => ASPECT_RATIOS.find(r => r.id === ratio) || ASPECT_RATIOS[0],
    [ratio]
  );

  // Apply quality slider to output dimensions (50-100% scale)
  const dims = useMemo(() => {
    const scale = 0.5 + (quality[0] / 100) * 0.5;
    return {
      w: Math.round(activeRatio.w * scale / 8) * 8,
      h: Math.round(activeRatio.h * scale / 8) * 8,
    };
  }, [activeRatio, quality]);

  const saveGeneration = async (
    prompt: string,
    imageUrl: string | null,
    resultText: string | null,
    videoUrl: string | null = null,
  ) => {
    // Always save locally so Explore works for guests + as fallback
    const local = addLocalCreation({
      prompt,
      tool_type: TOOL_TYPE[mode] as any,
      image_url: imageUrl,
      video_url: videoUrl,
      result_text: resultText,
    });
    setLastLocalId(local.id);

    if (!user) return null;
    try {
      const { data } = await supabase.from("generations").insert({
        user_id: user.id, prompt, image_url: imageUrl, result_text: resultText,
        tool_type: TOOL_TYPE[mode], is_public: true,
      }).select("id").maybeSingle();
      return data?.id ?? null;
    } catch {
      return null;
    }
  };

  // Smooth fake progress for visual feedback
  const startProgress = () => {
    setProgress(5);
    const id = window.setInterval(() => {
      setProgress(p => (p >= 92 ? p : p + Math.max(1, (95 - p) * 0.08)));
    }, 220);
    return () => window.clearInterval(id);
  };

  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;
    if (input.length > 500) {
      toast({ title: "Prompt muito longo", description: "Máximo 500 caracteres.", variant: "destructive" });
      return;
    }
    if (credits <= 0) {
      toast({
        title: "Sem créditos",
        description: "Você usou seus 5 créditos diários. Apoie via Pix para receber +50 bônus.",
        variant: "destructive",
      });
      setPixOpen(true);
      return;
    }

    const freshSeed = Math.floor(Math.random() * 999999);
    setSeed([freshSeed]);

    setIsLoading(true);
    setOutput("");
    setGeneratedImage(null);
    if (generatedVideo) URL.revokeObjectURL(generatedVideo.url);
    setGeneratedVideo(null);
    setLastGenId(null);
    setLastLocalId(null);
    setProgressLabel(mode === "video" ? "Iniciando geração de vídeo..." : "");
    const stop = mode === "video" ? () => {} : startProgress();

    const enrichedPrompt = PROMPT_BOOSTERS[mode](input);

    try {
      // ---- Text mode (streaming via Lovable AI → fallback Pollinations text → mock) ----
      if (mode === "text") {
        let response = "";
        let gotAny = false;
        let streamFailed = false;

        await new Promise<void>((resolve) => {
          streamChat({
            messages: [{ role: "user", content: enrichedPrompt }],
            mode: "creative",
            onDelta: (chunk) => { gotAny = true; response += chunk; setOutput(response); },
            onDone: () => resolve(),
            onError: (err) => {
              console.warn("[Studio] streamChat failed:", err);
              streamFailed = true;
              resolve();
            },
          });
        });

        if (!gotAny) {
          // Fallback: pollinations text
          try {
            setProgressLabel("Tentando provedor alternativo...");
            response = await pollinationsText(enrichedPrompt);
            setOutput(response);
          } catch (e) {
            console.warn("[Studio] pollinations text failed, using mock:", e);
            response = mockText(input);
            setOutput(response);
            toast({ title: "Modo offline", description: "Usando rascunho local — APIs indisponíveis." });
          }
        } else if (streamFailed && !response) {
          response = mockText(input);
          setOutput(response);
        }

        stop(); setProgress(100);
        await useCredit();
        const id = await saveGeneration(input, null, response);
        if (id) setLastGenId(id);
        toast({ title: "Adicionado ao Explore ✨" });
        return;
      }

      // ---- Video mode (real .webm via Canvas + MediaRecorder, fallback to image card) ----
      if (mode === "video") {
        if (typeof MediaRecorder === "undefined") {
          // Fallback: render an image card as "video thumbnail"
          toast({ title: "MediaRecorder indisponível", description: "Gerando preview estático em vez de vídeo." });
          const url = pollinationsImage(enrichedPrompt, {
            width: dims.w, height: dims.h, model: imgModel,
            enhance: creativity[0] >= 50, seed: freshSeed,
          });
          await preloadImage(url);
          setProgress(100);
          setGeneratedImage(url);
          setOutput(`Preview de vídeo (estático) ✨ — ${activeRatio.name}`);
          await useCredit();
          const id = await saveGeneration(input, url, null);
          if (id) setLastGenId(id);
          toast({ title: "Adicionado ao Explore ✨" });
          return;
        }
        const result = await generateVideo(enrichedPrompt, {
          width: dims.w,
          height: dims.h,
          seed: freshSeed,
          model: imgModel,
          enhance: creativity[0] >= 50,
          frames: Math.max(3, Math.min(8, Math.round(steps[0] / 8))),
          durationMs: 5000,
          fps: 30,
          onProgress: (pct, label) => {
            setProgress(pct);
            setProgressLabel(label);
          },
        });
        setProgress(100);
        setGeneratedVideo({ url: result.url, poster: result.posterUrl, mime: result.mime });
        setOutput(`Vídeo gerado ✨ — ${activeRatio.name}, ~5s`);
        await useCredit();
        const id = await saveGeneration(input, result.posterUrl, null, result.url);
        if (id) setLastGenId(id);
        toast({ title: "Adicionado ao Explore ✨" });
        return;
      }

      // ---- Image-like modes (Image / Avatar / Logo / 3D) ----
      const url = pollinationsImage(enrichedPrompt, {
        width: dims.w,
        height: dims.h,
        model: mode === "logo" ? "flux" : imgModel,
        enhance: creativity[0] >= 50,
        seed: freshSeed,
      });
      try {
        await preloadImage(url);
      } catch (e) {
        // Mock fallback: picsum seeded placeholder
        const fallbackUrl = `https://picsum.photos/seed/${freshSeed}/${dims.w}/${dims.h}`;
        await preloadImage(fallbackUrl);
        toast({ title: "Modo offline", description: "Usando placeholder — provedor de imagem indisponível." });
        stop(); setProgress(100);
        setGeneratedImage(fallbackUrl);
        setOutput(`Placeholder gerado ✨ — ${activeRatio.name}`);
        await useCredit();
        const id = await saveGeneration(input, fallbackUrl, null);
        if (id) setLastGenId(id);
        return;
      }
      stop(); setProgress(100);
      setGeneratedImage(url);

      const labelMap: Record<Mode, string> = {
        image: "Imagem gerada", video: "Vídeo gerado", "3d": "Render 3D gerado",
        avatar: "Avatar gerado", logo: "Logo gerado", text: "",
      };
      setOutput(`${labelMap[mode]} ✨ — ${activeRatio.name}, qualidade ${quality[0]}%`);

      await useCredit();
      const id = await saveGeneration(input, url, null);
      if (id) setLastGenId(id);
      toast({ title: "Adicionado ao Explore ✨" });
    } catch (e) {
      stop();
      const msg = e instanceof Error ? e.message : String(e);
      let friendly = "Falha ao gerar. Tente novamente em alguns segundos.";
      if (/Failed to fetch|NetworkError|network/i.test(msg)) friendly = "Sem conexão com o servidor de geração. Verifique sua internet.";
      else if (/MediaRecorder|captureStream/i.test(msg)) friendly = "Seu navegador não suporta gravação de vídeo. Tente Chrome/Edge atualizado.";
      else if (/frame|imagem/i.test(msg)) friendly = "Falha ao carregar quadros do vídeo. Tente outro prompt ou diminua a qualidade.";
      else if (/quota|rate|limit|429/i.test(msg)) friendly = "Limite de geração atingido. Aguarde 1 minuto.";
      toast({ title: "Erro ao gerar", description: friendly, variant: "destructive" });
      console.error("[Studio] generation error:", e);
    } finally {
      setIsLoading(false);
      setTimeout(() => { setProgress(0); setProgressLabel(""); }, 800);
    }
  };

  const handleDownload = async () => {
    if (generatedVideo) {
      const a = document.createElement("a");
      a.href = generatedVideo.url;
      a.download = `pixelnova-video-${Date.now()}.webm`;
      a.click();
      return;
    }
    if (generatedImage) {
      try {
        const res = await fetch(generatedImage);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `pixelnova-${mode}-${Date.now()}.${blob.type.includes("png") ? "png" : "jpg"}`;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        console.warn("download fallback:", err);
        window.open(generatedImage, "_blank");
        toast({ title: "Download via nova aba", description: "Salve clicando com o botão direito na imagem." });
      }
    } else if (output) {
      try {
        const blob = new Blob([output], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `pixelnova-text-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        toast({ title: "Erro ao baixar", description: "Não foi possível gerar o arquivo.", variant: "destructive" });
      }
    }
  };

  const handleCopy = async () => {
    const text = output || input;
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      toast({ title: "Copiado!" });
    }
  };

  const handleRemix = () => {
    setOutput("");
    setGeneratedImage(null);
    if (generatedVideo) URL.revokeObjectURL(generatedVideo.url);
    setGeneratedVideo(null);
    setSeed([Math.floor(Math.random() * 999999)]);
    toast({ title: "Pronto para remixar", description: "Edite o prompt e gere novamente." });
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Brand header — mascot preserved */}
        <div className="flex items-center gap-3 mb-3">
          <img src={mascotImg} alt="Lumy" className="h-10 w-10 animate-float" width={40} height={40} />
          <div className="flex-1">
            <h2 className="font-heading text-2xl font-bold gradient-text">PixelNova AI Studio</h2>
            <p className="text-xs text-muted-foreground">{activeMode.hint}</p>
          </div>
          <button
            onClick={() => setPixOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition"
          >
            <Heart className="h-3.5 w-3.5" /> Support / Buy Credits
          </button>
        </div>
        <PixSupportModal open={pixOpen} onOpenChange={setPixOpen} />

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6 p-1 bg-muted rounded-xl w-fit">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                mode === m.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <m.icon className="h-3.5 w-3.5" /> {m.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          {/* Controls panel */}
          <aside className="rounded-xl border border-border bg-card p-5 space-y-5 h-fit">
            {/* Aspect ratio */}
            {mode !== "text" && (
              <div>
                <label className="text-xs text-muted-foreground mb-2 block font-medium">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {ASPECT_RATIOS.slice(0, 4).map(r => (
                    <button
                      key={r.id}
                      onClick={() => setRatio(r.id)}
                      disabled={isLoading}
                      className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-all ${
                        ratio === r.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r.id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model (for image-like modes) */}
            {mode !== "text" && mode !== "logo" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block font-medium">Model</label>
                <select
                  value={imgModel} onChange={e => setImgModel(e.target.value)} disabled={isLoading}
                  className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border"
                >
                  {POLLINATIONS_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}

            {/* Sliders */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-muted-foreground font-medium">Creativity</label>
                <span className="text-xs text-primary font-semibold">{creativity[0]}%</span>
              </div>
              <Slider value={creativity} onValueChange={setCreativity} max={100} step={1} disabled={isLoading} />
            </div>

            {mode !== "text" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-muted-foreground font-medium">Quality</label>
                  <span className="text-xs text-primary font-semibold">{quality[0]}%</span>
                </div>
                <Slider value={quality} onValueChange={setQuality} max={100} step={5} disabled={isLoading} />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-muted-foreground font-medium">Steps</label>
                <span className="text-xs text-primary font-semibold">{steps[0]}</span>
              </div>
              <Slider value={steps} onValueChange={setSteps} min={10} max={60} step={1} disabled={isLoading} />
            </div>

            {mode !== "text" && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-muted-foreground font-medium">Seed</label>
                  <button
                    onClick={() => setSeed([Math.floor(Math.random() * 999999)])}
                    disabled={isLoading}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    {seed[0]} ↻
                  </button>
                </div>
                <Slider value={seed} onValueChange={setSeed} max={999999} step={1} disabled={isLoading} />
              </div>
            )}

            {user && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 pt-2 border-t border-border">
                <Sparkles className="h-3 w-3 text-primary" /> 1 crédito • {credits} restantes
              </p>
            )}
          </aside>

          {/* Output area */}
          <div className="space-y-4">
            {/* Prompt input */}
            <div className="rounded-xl border border-border bg-card p-4">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                placeholder={activeMode.placeholder}
                rows={3}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-2">
                <span className="text-xs text-muted-foreground">
                  {input.length}/500 chars
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={!input.trim() || isLoading || (user !== null && credits <= 0)}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Generate
                </button>
              </div>
              {progress > 0 && (
                <div className="mt-3 space-y-1">
                  <Progress value={progress} className="h-1" />
                  {progressLabel && (
                    <p className="text-[10px] text-muted-foreground">{progressLabel}</p>
                  )}
                </div>
              )}
            </div>

            {/* Output container — respects aspect ratio */}
            <div className="rounded-xl border border-border bg-card p-4">
              <OutputCanvas
                mode={mode}
                ratioId={ratio}
                image={generatedImage}
                video={generatedVideo}
                text={output}
                isLoading={isLoading}
              />

              {(generatedImage || generatedVideo || output) && !isLoading && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  <button onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/70 text-xs font-medium text-foreground transition">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/70 text-xs font-medium text-foreground transition">
                    {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copiado" : (output && !generatedImage ? "Copy text" : "Copy prompt")}
                  </button>
                  <button onClick={handleRemix}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-muted/70 text-xs font-medium text-foreground transition">
                    <Repeat className="h-3.5 w-3.5" /> Remix
                  </button>
                  {lastGenId && (
                    <Link to={`/create/${lastGenId}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-xs font-medium text-primary transition ml-auto">
                      Ver no Explore →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ---------- Output canvas (respects aspect ratio + mode visuals) ----------
const OutputCanvas = ({
  mode, ratioId, image, video, text, isLoading,
}: {
  mode: Mode; ratioId: string; image: string | null;
  video: { url: string; poster: string; mime: string } | null;
  text: string; isLoading: boolean;
}) => {
  const ratio = ASPECT_RATIOS.find(r => r.id === ratioId) || ASPECT_RATIOS[0];
  const aspectStyle = mode === "text"
    ? undefined
    : { aspectRatio: `${ratio.w} / ${ratio.h}` };

  // Empty state
  if (!image && !video && !text && !isLoading) {
    return (
      <div
        style={aspectStyle}
        className="w-full bg-muted/40 rounded-lg flex flex-col items-center justify-center text-center text-muted-foreground p-6 min-h-[240px]"
      >
        <Sparkles className="h-8 w-8 text-primary/40 mb-2" />
        <p className="text-sm font-medium">Your {mode} preview will appear here</p>
        <p className="text-xs mt-1">Aspect ratio: {ratio.id}</p>
      </div>
    );
  }

  // Loading state
  if (isLoading && !image && !video && !text) {
    return (
      <div
        style={aspectStyle}
        className="w-full bg-muted/40 rounded-lg flex flex-col items-center justify-center min-h-[240px] animate-pulse"
      >
        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">
          {mode === "text" ? "Writing..." : `Rendering ${mode}...`}
        </p>
      </div>
    );
  }

  // Text mode
  if (mode === "text") {
    return (
      <div className="bg-muted/40 rounded-lg p-5 min-h-[180px]">
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground">
          <ReactMarkdown>{text || ""}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // Video mode — real <video> player
  if (mode === "video" && video) {
    return (
      <div style={aspectStyle} className="relative w-full rounded-lg overflow-hidden bg-black">
        <video
          src={video.url}
          poster={video.poster}
          controls
          autoPlay
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <span className="absolute top-2 left-3 text-[10px] font-semibold uppercase tracking-wider text-primary bg-background/80 px-2 py-0.5 rounded">Video • {ratio.id}</span>
      </div>
    );
  }

  // 3D mode — image inside rotating cube wrapper
  if (mode === "3d" && image) {
    return (
      <div style={aspectStyle} className="relative w-full rounded-lg overflow-hidden bg-gradient-to-br from-muted/60 to-muted/20 flex items-center justify-center perspective-[800px]">
        <div className="relative w-3/4 h-3/4 animate-spin-slow" style={{ transformStyle: "preserve-3d" }}>
          <img src={image} alt="3D render" className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl shadow-primary/20" />
        </div>
        <span className="absolute top-2 left-3 text-[10px] font-semibold uppercase tracking-wider text-primary bg-background/80 px-2 py-0.5 rounded">3D</span>
      </div>
    );
  }

  // Logo mode — checker bg to suggest transparency
  if (mode === "logo" && image) {
    return (
      <div
        style={aspectStyle}
        className="w-full rounded-lg overflow-hidden flex items-center justify-center"
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            backgroundImage:
              "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
          }}
        >
          <img src={image} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
        </div>
      </div>
    );
  }

  // Default: image / avatar
  return (
    <div style={aspectStyle} className="w-full rounded-lg overflow-hidden bg-muted/40">
      {image && <img src={image} alt="Generated" className="w-full h-full object-cover" />}
    </div>
  );
};

export default AILabSection;
