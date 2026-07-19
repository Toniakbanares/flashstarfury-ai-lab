import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Image as ImageIcon, User, Loader2, Square, RotateCcw, Copy, Check, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import mascotImg from "@/assets/mascot.png";
import { streamChat, generateImage } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/share";

interface Message {
  id: string;
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

const STORAGE_KEY = "pixelnova_chat_history_v1";
const MODEL_KEY = "pixelnova_chat_model_v1";

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hi! I'm **Lumy**, your AI assistant at StarFury AI. Ask anything or generate an image.",
};

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [WELCOME];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [WELCOME];
  } catch {
    return [WELCOME];
  }
}

const uid = () => `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const ChatSection = () => {
  const { toast } = useToast();
  const [model, setModel] = useState<string>(() => localStorage.getItem(MODEL_KEY) || MODELS[2].id);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Persist chat + model
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
  }, [messages]);
  useEffect(() => { localStorage.setItem(MODEL_KEY, model); }, [model]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runStream = useCallback(
    async (history: Message[]) => {
      setIsLoading(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const assistantId = uid();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
      let acc = "";
      let gotAny = false;

      await streamChat({
        messages: history.filter((m) => !m.image && m.id !== "welcome").map((m) => ({ role: m.role, content: m.content })),
        model,
        signal: ctrl.signal,
        onDelta: (chunk) => {
          gotAny = true;
          acc += chunk;
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
        },
        onDone: () => {
          if (!gotAny) {
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: "_(no response — try again)_" } : m)));
          }
          setIsLoading(false);
          abortRef.current = null;
        },
        onError: (error) => {
          if (!gotAny) {
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
            toast({ title: "Connection error", description: error, variant: "destructive" });
          }
          setIsLoading(false);
          abortRef.current = null;
        },
      });
    },
    [model, toast],
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: uid(), role: "user", content: input.trim() };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    await runStream(nextHistory);
  };

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  };

  const handleRegenerate = async () => {
    if (isLoading) return;
    // Drop the last assistant message (if any) and re-run using history up to last user
    let cut = [...messages];
    while (cut.length && cut[cut.length - 1].role === "assistant") cut.pop();
    if (!cut.length || cut[cut.length - 1].role !== "user") {
      toast({ title: "Nothing to regenerate" });
      return;
    }
    setMessages(cut);
    await runStream(cut);
  };

  const handleClear = () => {
    handleStop();
    setMessages([WELCOME]);
  };

  const handleCopyMsg = async (m: Message) => {
    if (await copyToClipboard(m.content)) {
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((c) => (c === m.id ? null : c)), 1400);
    }
  };

  const handleGenerateImage = async () => {
    if (!input.trim() || isGeneratingImage || isLoading) return;
    const prompt = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { id: uid(), role: "user", content: `🎨 ${prompt}` }]);
    setIsGeneratingImage(true);
    const result = await generateImage(prompt);
    if (result.imageUrl) {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: result.text || "Image ready.", image: result.imageUrl },
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

  const busy = isLoading || isGeneratingImage;

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <img src={mascotImg} alt="Lumy" className="h-8 w-8" width={32} height={32} />
          <h2 className="font-heading text-xl font-bold text-foreground">AI Chat</h2>
          <div className="ml-auto flex items-center gap-2">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              aria-label="Model"
              disabled={isLoading}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
              aria-label="Clear conversation"
              title="Clear conversation"
              disabled={busy}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
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
                <div className="max-w-[80%] space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_pre]:my-2 [&_pre]:bg-background/60 [&_pre]:border [&_pre]:border-border [&_pre]:rounded-md [&_code]:text-xs">
                      <ReactMarkdown>{msg.content || (msg.role === "assistant" && isLoading ? "_..._" : "")}</ReactMarkdown>
                    </div>
                    {msg.image && <img src={msg.image} alt="Generated" className="mt-2 rounded-lg max-w-full" loading="lazy" />}
                  </div>
                  {msg.role === "assistant" && msg.content && msg.id !== "welcome" && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <button
                        onClick={() => handleCopyMsg(msg)}
                        className="p-1 rounded hover:text-foreground hover:bg-muted transition"
                        aria-label="Copy message"
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  )}
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

          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-end gap-2">
              <button
                onClick={handleGenerateImage}
                disabled={!input.trim() || busy}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors disabled:opacity-40 min-h-[40px]"
                aria-label="Generate image from prompt"
                title="Generate image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything… (Shift+Enter for newline)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none max-h-40 py-2"
                disabled={busy}
              />
              {isLoading ? (
                <button
                  onClick={handleStop}
                  className="p-2 rounded-lg bg-destructive/90 text-destructive-foreground hover:opacity-90 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Stop generation"
                  title="Stop"
                >
                  <Square className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || busy}
                  className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-all min-h-[40px] min-w-[40px] flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{messages.filter((m) => m.id !== "welcome").length} messages</span>
              <button
                onClick={handleRegenerate}
                disabled={busy || messages.length < 2}
                className="flex items-center gap-1 hover:text-foreground disabled:opacity-40 transition"
              >
                <RotateCcw className="h-3 w-3" /> Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatSection;
