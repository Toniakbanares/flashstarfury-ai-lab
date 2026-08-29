import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, Square, Copy, Download, Save, Wand2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { askAIStream, askAI, AiError } from "@/lib/musicAi";
import { saveProject, downloadText } from "@/lib/musicStore";
import {
  MAGIC_PROMPT_SYSTEM,
  QUICK_STYLES,
  SONG_BRIEF_SYSTEM,
  SONG_CRITIC_SYSTEM,
  SONG_DRAFT_SYSTEM,
  SONG_FINAL_SYSTEM,
  LYRIC_LANGUAGES,
  languageDirective,
  type LyricLanguageId,
  randomSeedIdea,
} from "@/lib/musicIdeas";

type Msg = { id: string; role: "user" | "assistant"; content: string };

const uid = () => Math.random().toString(36).slice(2);

const titleOf = (text: string) => {
  const m = text.match(/T[ÍI]TULO:\s*(.+)/i);
  return m?.[1]?.trim() || "musica";
};

const SongComposerChat = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [magic, setMagic] = useState(false);
  const [phase, setPhase] = useState("");
  const [lang, setLang] = useState<LyricLanguageId>("pt-BR");
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    const history = messages
      .slice(-6)
      .map((m) => `${m.role === "user" ? "PEDIDO" : "MÚSICA ANTERIOR"}:\n${m.content}`)
      .join("\n\n");

    const userMsg: Msg = { id: uid(), role: "user", content: text };
    const aiMsg: Msg = { id: uid(), role: "assistant", content: "" };
    setMessages((m) => [...m, userMsg, aiMsg]);
    setInput("");
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const originalRequest = `${history ? `Contexto da conversa (use apenas se o pedido for uma continuação/ajuste):\n${history}\n\n` : ""}PEDIDO DO ARTISTA:\n${text}`;

      setPhase("Interpretando o tema e a verdade humana…");
      const brief = await askAI(SONG_BRIEF_SYSTEM, originalRequest, ctrl.signal);

      setPhase("Construindo narrativa, refrão e métrica…");
      const draft = await askAI(
        SONG_DRAFT_SYSTEM,
        `${originalRequest}\n\nBRIEFING APROVADO:\n${brief}`,
        ctrl.signal,
      );

      setPhase("Revisando coerência e eliminando versos artificiais…");
      const critique = await askAI(
        SONG_CRITIC_SYSTEM,
        `${originalRequest}\n\nBRIEFING:\n${brief}\n\nPRIMEIRA VERSÃO:\n${draft}`,
        ctrl.signal,
      );

      setPhase("Finalizando a versão profissional…");
      await askAIStream(
        SONG_FINAL_SYSTEM,
        `${originalRequest}\n\nBRIEFING:\n${brief}\n\nPRIMEIRA VERSÃO:\n${draft}\n\nCRÍTICA EDITORIAL OBRIGATÓRIA:\n${critique}`,
        (acc) => setMessages((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, content: acc } : x))),
        ctrl.signal,
      );
    } catch (e) {
      const msg = e instanceof AiError || e instanceof Error ? e.message : "Falha ao compor";
      if (!ctrl.signal.aborted) {
        toast.error(msg);
        setMessages((m) => m.map((x) => (x.id === aiMsg.id && !x.content ? { ...x, content: `⚠️ ${msg}` } : x)));
      }
    } finally {
      setBusy(false);
      setPhase("");
      abortRef.current = null;
      inputRef.current?.focus();
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setBusy(false);
    setPhase("");
    toast("Composição interrompida");
  };

  const magicPrompt = async () => {
    if (magic || busy) return;
    setMagic(true);
    try {
      const seed = randomSeedIdea();
      const out = await askAI(
        MAGIC_PROMPT_SYSTEM,
        `Semente criativa (use como inspiração, não copie literalmente): ${seed}\n${input.trim() ? `Ideia do artista: ${input.trim()}` : ""}`,
      );
      const clean = out.replace(/^["'`\s]+|["'`\s]+$/g, "").split("\n").filter(Boolean)[0] || out.trim();
      setInput(clean);
      inputRef.current?.focus();
      toast.success("Magic Prompt pronto");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível gerar o prompt");
    } finally {
      setMagic(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Música copiada");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const download = (text: string) => {
    try {
      downloadText(text, `${titleOf(text).replace(/[^\w\s-]/g, "").slice(0, 40) || "musica"}.txt`);
    } catch {
      toast.error("Não foi possível baixar");
    }
  };

  const save = (text: string) => {
    try {
      saveProject({ title: titleOf(text), artist: "Você", lyrics: text, status: "draft" });
      toast.success("Salvo no Dashboard");
    } catch {
      toast.error("Não foi possível salvar");
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/40 min-h-[32rem]">
      {/* Messages */}
      <div ref={boxRef} className="flex-1 overflow-auto p-4 space-y-4 max-h-[60vh]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="mx-auto mb-3 w-fit rounded-xl bg-primary/10 p-3"><Sparkles className="h-6 w-6 text-primary" /></div>
            <h3 className="font-heading text-lg font-semibold">Compositor de músicas</h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              Escreva um único prompt. O compositor interpreta o tema, constrói a narrativa, compõe, critica e reescreve antes de entregar
              a música completa com letra humana, prompt de estilo e ficha técnica.
              Sem ideia? Use o <strong>Magic Prompt</strong>.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {QUICK_STYLES.map((s) => (
                <button key={s.label} onClick={() => send(s.prompt)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium hover:border-primary/40 hover:bg-primary/10 transition">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/15 px-3.5 py-2 text-sm text-foreground">{m.content}</div>
            </div>
          ) : (
            <div key={m.id} className="rounded-2xl rounded-bl-sm border border-border bg-card p-3">
              {m.content ? (
                <>
                  <pre className="whitespace-pre-wrap font-body text-sm text-foreground">{m.content}</pre>
                  <div className="mt-2 flex gap-1.5 border-t border-border pt-2">
                    <button onClick={() => copy(m.content)} title="Copiar" className="rounded-md border border-border p-1.5 hover:border-primary/40"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={() => download(m.content)} title="Baixar" className="rounded-md border border-border p-1.5 hover:border-primary/40"><Download className="h-3.5 w-3.5" /></button>
                    <button onClick={() => save(m.content)} title="Salvar no Dashboard" className="rounded-md border border-border p-1.5 hover:border-primary/40"><Save className="h-3.5 w-3.5" /></button>
                    <button onClick={() => send("Refaça essa música com outra abordagem, mantendo o estilo e o tema, mas com letra e título totalmente novos.")}
                      disabled={busy} title="Gerar variação" className="rounded-md border border-border p-1.5 hover:border-primary/40 disabled:opacity-40"><Wand2 className="h-3.5 w-3.5" /></button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {phase || "Preparando composição…"}</div>
                  <div className="h-1 overflow-hidden rounded-full bg-muted"><div className="h-full w-2/3 animate-pulse rounded-full bg-primary" /></div>
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="ex.: uma música punk sobre largar o emprego numa sexta-feira à noite"
            className="min-h-[3rem] max-h-40 flex-1 resize-y rounded-lg border border-border bg-card p-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {busy ? (
            <button onClick={stop} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted">
              <Square className="h-3.5 w-3.5" /> Parar
            </button>
          ) : (
            <button onClick={() => void send()} disabled={!input.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              <Send className="h-4 w-4" /> Compor
            </button>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button onClick={magicPrompt} disabled={magic || busy}
            className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
            {magic ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Magic Prompt
          </button>
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); toast("Conversa limpa"); }}
              className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground">
              <Trash2 className="h-3 w-3" /> Limpar
            </button>
          )}
          <span className="text-[10px] text-muted-foreground">Enter envia · Shift+Enter quebra linha</span>
        </div>
      </div>
    </div>
  );
};

export default SongComposerChat;
