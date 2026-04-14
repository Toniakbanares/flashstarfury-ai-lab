import { useState } from "react";
import { Bot, Image, MessageSquare, Wand2, Zap, Globe, Send, Loader2, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import mascotImg from "@/assets/mascot.png";
import { streamChat, generateImage } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

type Tool = "chat" | "image" | "creative" | "search" | null;

const tools = [
  { id: "chat" as Tool, icon: MessageSquare, title: "Chat Inteligente", description: "Converse com IA avançada sobre qualquer assunto.", color: "text-accent" },
  { id: "image" as Tool, icon: Image, title: "Geração de Imagens", description: "Crie imagens a partir de descrições de texto.", color: "text-primary" },
  { id: "creative" as Tool, icon: Wand2, title: "Assistente Criativo", description: "Escreva textos, poemas, código e muito mais.", color: "text-secondary" },
  { id: "search" as Tool, icon: Globe, title: "Busca Inteligente", description: "Pesquise informações com IA contextual.", color: "text-glow-blue" },
];

const AILabSection = () => {
  const { toast } = useToast();
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    setGeneratedImage(null);

    if (activeTool === "image") {
      const result = await generateImage(input);
      if (result.error) {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      } else if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setOutput(result.text || "Imagem gerada com sucesso! ✨");
      }
      setIsLoading(false);
    } else {
      let response = "";
      await streamChat({
        messages: [{ role: "user", content: input }],
        mode: activeTool === "creative" ? "creative" : activeTool === "search" ? "search" : undefined,
        onDelta: (chunk) => { response += chunk; setOutput(response); },
        onDone: () => setIsLoading(false),
        onError: (error) => { toast({ title: "Erro", description: error, variant: "destructive" }); setIsLoading(false); },
      });
    }
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
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={activeTool === "image" ? "Descreva a imagem que deseja criar..." : "Digite sua pergunta..."}
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
          Explore ferramentas poderosas de inteligência artificial, todas integradas e prontas para uso.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {tools.map((tool) => (
            <button key={tool.id} onClick={() => setActiveTool(tool.id)}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 text-left">
              <tool.icon className={`h-8 w-8 mb-4 ${tool.color} transition-transform group-hover:scale-110`} />
              <h3 className="font-heading text-sm font-semibold mb-2 text-card-foreground">{tool.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
              <span className="inline-block mt-3 text-xs font-semibold text-primary">Usar agora →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AILabSection;
