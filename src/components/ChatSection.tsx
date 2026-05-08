import { useState, useRef, useEffect } from "react";
import { Send, Image, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import mascotImg from "@/assets/mascot.png";
import { streamChat, generateImage } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const MODELS = [
  { id: "anthropic/claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
  { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "deepseek/deepseek-chat", label: "DeepSeek V3" },
  { id: "mistralai/mistral-large", label: "Mistral Large" },
] as const;

const ChatSection = () => {
  const { toast } = useToast();
  const [model, setModel] = useState<string>(MODELS[2].id);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hi! I'm **Lumy**, your AI assistant at PixelNova AI. Ask anything or generate an image.",
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
    let gotAnyDelta = false;
    const allMessages = [...messages.filter((m) => !m.image), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const appendAssistant = (text: string) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.id === -1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: text } : m));
        }
        return [...prev, { id: -1, role: "assistant", content: text }];
      });
    };

    await streamChat({
      messages: allMessages,
      model,
      onDelta: (chunk) => {
        gotAnyDelta = true;
        assistantSoFar += chunk;
        appendAssistant(assistantSoFar);
      },
      onDone: () => {
        setMessages((prev) => prev.map((m) => (m.id === -1 ? { ...m, id: Date.now() } : m)));
        setIsLoading(false);
      },
      onError: (error) => {
        if (!gotAnyDelta) {
          toast({ title: "Connection error", description: error, variant: "destructive" });
        }
        setIsLoading(false);
      },
    });
    void currentInput;
  };

  const handleGenerateImage = async () => {
    if (!input.trim() || isGeneratingImage) return;
    const prompt = input;
    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", content: `🎨 ${prompt}` }]);
    setIsGeneratingImage(true);

    const result = await generateImage(prompt);
    if (result.imageUrl) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", content: result.text || "Image ready.", image: result.imageUrl },
      ]);
    } else {
      toast({
        title: "Image provider unavailable",
        description: result.error || "Please try again later.",
        variant: "destructive",
      });
    }
    setIsGeneratingImage(false);
  };

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <img src={mascotImg} alt="Lumy" className="h-8 w-8" width={32} height={32} />
          <h2 className="font-heading text-xl font-bold text-foreground">AI Chat</h2>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="ml-auto bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            aria-label="Model"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]">
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
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
                  {msg.image && <img src={msg.image} alt="Generated" className="mt-2 rounded-lg max-w-full" loading="lazy" />}
                </div>
              </div>
            ))}
            {(isLoading || isGeneratingImage) && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <img src={mascotImg} alt="Lumy" className="h-8 w-8 rounded-full" width={32} height={32} />
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isGeneratingImage ? "Generating image..." : "Thinking..."}
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
              aria-label="Generate image"
              title="Generate image"
            >
              <Image className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask anything…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              disabled={isLoading || isGeneratingImage}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isGeneratingImage}
              className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all"
              aria-label="Send"
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
