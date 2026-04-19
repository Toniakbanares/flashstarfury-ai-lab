import { useState, useRef, useEffect } from "react";
import { Send, Image, Sparkles, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import mascotImg from "@/assets/mascot.png";
import { streamChat, generateImage } from "@/lib/ai";
import { puterChat, puterImage, isPuterReady } from "@/lib/puter";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const ChatSection = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Olá! ✨ Eu sou o **Lumy**, seu assistente de IA no Flash Star Fury! Posso te ajudar com perguntas, gerar imagens, escrever textos e muito mais. O que você gostaria de fazer hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages.filter(m => !m.image), userMsg].map(m => ({ role: m.role, content: m.content }));

    await streamChat({
      messages: allMessages,
      onDelta: (chunk) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === -1) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { id: -1, role: "assistant", content: assistantSoFar }];
        });
      },
      onDone: () => {
        setMessages((prev) => prev.map(m => m.id === -1 ? { ...m, id: Date.now() } : m));
        setIsLoading(false);
      },
      onError: (error) => {
        toast({ title: "Erro", description: error, variant: "destructive" });
        setIsLoading(false);
      },
    });
  };

  const handleGenerateImage = async () => {
    if (!input.trim() || isGeneratingImage) return;
    const prompt = input;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), role: "user", content: `🎨 Gerar imagem: ${prompt}` }]);
    setIsGeneratingImage(true);

    const result = await generateImage(prompt);
    if (result.error) {
      toast({ title: "Erro", description: result.error, variant: "destructive" });
    } else if (result.imageUrl) {
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: result.text || "Aqui está sua imagem! ✨", image: result.imageUrl }]);
    }
    setIsGeneratingImage(false);
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <img src={mascotImg} alt="Lumy" className="h-8 w-8 animate-float" width={32} height={32} />
          <h2 className="font-heading text-2xl font-bold gradient-text">Chat com IA</h2>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className="flex-shrink-0">
                  {msg.role === "assistant" ? (
                    <img src={mascotImg} alt="Lumy" className="h-8 w-8 rounded-full" width={32} height={32} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.image && (
                    <img src={msg.image} alt="Imagem gerada" className="mt-2 rounded-lg max-w-full" />
                  )}
                </div>
              </div>
            ))}
            {(isLoading || isGeneratingImage) && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <img src={mascotImg} alt="Lumy" className="h-8 w-8 rounded-full" width={32} height={32} />
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isGeneratingImage ? "Gerando imagem..." : "Pensando..."}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-3 flex items-center gap-2">
            <button
              onClick={handleGenerateImage}
              disabled={!input.trim() || isGeneratingImage || isLoading}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors disabled:opacity-40"
              aria-label="Gerar imagem"
              title="Gerar imagem com IA"
            >
              <Image className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Digite sua mensagem para o Lumy..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              disabled={isLoading || isGeneratingImage}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isGeneratingImage}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
