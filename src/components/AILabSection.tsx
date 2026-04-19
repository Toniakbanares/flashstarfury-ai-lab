import { useState } from "react";
import {
  Bot, Image, MessageSquare, Wand2, Globe, Send, Loader2, ArrowLeft,
  Code, FileText, Languages, Music, Mic, Calculator, BookOpen, Palette
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import mascotImg from "@/assets/mascot.png";
import { streamChat } from "@/lib/ai";
import { pollinationsImage, pollinationsText, preloadImage, POLLINATIONS_MODELS, ASPECT_RATIOS } from "@/lib/freeai";
import { useToast } from "@/hooks/use-toast";

type Tool = "chat" | "image" | "creative" | "search" | "code" | "summarize" | "translate" | "poem" | null;

const tools = [
  { id: "chat" as Tool, icon: MessageSquare, title: "Chat Inteligente", description: "Converse com IA avançada sobre qualquer assunto.", color: "text-accent" },
  { id: "image" as Tool, icon: Image, title: "Geração de Imagens", description: "Crie imagens incríveis a partir de texto.", color: "text-primary" },
  { id: "creative" as Tool, icon: Wand2, title: "Assistente Criativo", description: "Escreva textos, roteiros e conteúdo criativo.", color: "text-secondary" },
  { id: "search" as Tool, icon: Globe, title: "Busca Inteligente", description: "Pesquise informações com IA contextual.", color: "text-glow-blue" },
  { id: "code" as Tool, icon: Code, title: "Gerador de Código", description: "Gere código em qualquer linguagem de programação.", color: "text-accent" },
  { id: "summarize" as Tool, icon: FileText, title: "Resumidor de Textos", description: "Resuma artigos, documentos e textos longos.", color: "text-primary" },
  { id: "translate" as Tool, icon: Languages, title: "Tradutor Universal", description: "Traduza textos entre qualquer idioma.", color: "text-secondary" },
  { id: "poem" as Tool, icon: BookOpen, title: "Poeta IA", description: "Crie poemas, haikus e textos poéticos.", color: "text-glow-blue" },
];

const modeMap: Record<string, string> = {
  chat: "chat",
  creative: "creative",
  search: "search",
  code: "code",
  summarize: "creative",
  translate: "creative",
  poem: "creative",
};

const systemHints: Record<string, string> = {
  code: "Gere código limpo e bem comentado para: ",
  summarize: "Resuma o seguinte texto de forma clara e concisa: ",
  translate: "Traduza o seguinte texto: ",
  poem: "Escreva um poema criativo sobre: ",
};

const AILabSection = () => {
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imgModel, setImgModel] = useState<string>("flux");
  const [imgRatio, setImgRatio] = useState<string>("1:1");
  const [imgEnhance, setImgEnhance] = useState<boolean>(true);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    setGeneratedImage(null);

    if (activeTool === "image") {
      try {
        const ratio = ASPECT_RATIOS.find(r => r.id === imgRatio) || ASPECT_RATIOS[0];
        const url = pollinationsImage(input, {
          width: ratio.w,
          height: ratio.h,
          model: imgModel,
          enhance: imgEnhance,
        });
        await preloadImage(url);
        setGeneratedImage(url);
        setOutput(`Imagem gerada! ✨ (${POLLINATIONS_MODELS.find(m => m.id === imgModel)?.name}, ${ratio.name})`);
      } catch (e) {
        toast({ title: "Erro", description: "Falha ao gerar imagem. Tente novamente.", variant: "destructive" });
      }
      setIsLoading(false);
    } else {
      let response = "";
      const hint = systemHints[activeTool || ""] || "";
      const userContent = hint ? `${hint}${input}` : input;
      let gotAnyDelta = false;

      await streamChat({
        messages: [{ role: "user", content: userContent }],
        mode: modeMap[activeTool || "chat"] || undefined,
        onDelta: (chunk) => { gotAnyDelta = true; response += chunk; setOutput(response); },
        onDone: () => setIsLoading(false),
        onError: async (error) => {
          if (!gotAnyDelta) {
            try {
              const txt = await pollinationsText(userContent, "Você é o Lumy, assistente do Flash Star Fury. Responda em português brasileiro com markdown e emojis.");
              setOutput(txt);
            } catch {
              toast({ title: "Erro", description: error, variant: "destructive" });
            }
          } else {
            toast({ title: "Erro", description: error, variant: "destructive" });
          }
          setIsLoading(false);
        },
      });
    }
  };

  const placeholders: Record<string, string> = {
    image: "Descreva a imagem que deseja criar...",
    code: "Descreva o código que precisa (ex: 'função de login em Python')...",
    summarize: "Cole o texto que deseja resumir...",
    translate: "Digite o texto e o idioma destino (ex: 'Hello world → português')...",
    poem: "Sobre o que você quer um poema?",
  };

  if (activeTool) {
    const tool = tools.find(t => t.id === activeTool)!;
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <button onClick={() => { setActiveTool(null); setOutput(""); setGeneratedImage(null); setInput(""); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Laboratório
          </button>

          <div className="flex items-center gap-3 mb-6">
            <img src={mascotImg} alt="Lumy" className="h-10 w-10 animate-float" width={40} height={40} />
            <div>
              <h2 className="font-heading text-xl font-bold gradient-text">{tool.title}</h2>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            {activeTool === "image" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Modelo de arte</label>
                  <select value={imgModel} onChange={e => setImgModel(e.target.value)} disabled={isLoading}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border">
                    {POLLINATIONS_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Aspect ratio</label>
                  <select value={imgRatio} onChange={e => setImgRatio(e.target.value)} disabled={isLoading}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none border border-border">
                    {ASPECT_RATIOS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={imgEnhance} onChange={e => setImgEnhance(e.target.checked)} disabled={isLoading}
                      className="w-4 h-4 rounded accent-primary" />
                    Melhorar prompt (IA)
                  </label>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={placeholders[activeTool || ""] || "Digite sua pergunta..."}
                className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
                disabled={isLoading} />
              <button onClick={handleSubmit} disabled={!input.trim() || isLoading}
                className="p-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            {(output || generatedImage) && (
              <div className="bg-muted rounded-lg p-4">
                {generatedImage && <img src={generatedImage} alt="Gerada por IA" className="rounded-lg mb-3 max-w-full" />}
                {output && (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                    <ReactMarkdown>{output}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {isLoading && !output && !generatedImage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                {activeTool === "image" ? "Gerando imagem..." : "Processando..."}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-3">
          <img src={mascotImg} alt="Lumy" className="h-8 w-8 animate-float" width={32} height={32} />
          <h2 className="font-heading text-2xl font-bold gradient-text">Laboratório de IA</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Explore 8 ferramentas poderosas de inteligência artificial, todas integradas e prontas para uso.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 text-left">
              <tool.icon className={`h-7 w-7 mb-3 ${tool.color} transition-transform group-hover:scale-110`} />
              <h3 className="font-heading text-sm font-semibold mb-1.5 text-card-foreground">{tool.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
              <span className="inline-block mt-2 text-xs font-semibold text-primary">Usar agora →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AILabSection;
