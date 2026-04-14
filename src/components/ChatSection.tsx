import { useState } from "react";
import { Send, Image, Sparkles, Bot, User } from "lucide-react";
import mascotImg from "@/assets/mascot.png";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const ChatSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Olá! ✨ Eu sou o Lumy, seu assistente de IA no Flash Star Fury! Posso te ajudar com perguntas, gerar imagens, escrever textos e muito mais. O que você gostaria de fazer hoje?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "🌟 Obrigado pela mensagem! Para ativar respostas reais de IA, o laboratório precisa ser conectado ao backend com Lovable Cloud. Deseja que eu configure isso?",
        },
      ]);
    }, 1000);
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="font-heading text-2xl font-bold gradient-text">Chat com IA</h2>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
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
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex items-center gap-2">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors" aria-label="Gerar imagem">
              <Image className="h-5 w-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua mensagem para o Lumy..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
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
