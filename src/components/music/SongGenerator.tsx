import { useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Shuffle, Copy, Download, Save, Square, Wand2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { askAIStream, AiError } from "@/lib/musicAi";
import { saveProject, downloadText } from "@/lib/musicStore";
import {
  GENRES, MOODS, VOICES, TEMPOS, LANGUAGES, STRUCTURES, PRESETS,
  randomIdea, randomTheme, buildSongBrief, buildStylePrompt, SONG_SYSTEM, type SongIdea,
} from "@/lib/musicIdeas";

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
    {children}
  </label>
);

const SongGenerator = () => {
  const [idea, setIdea] = useState<SongIdea>(() => PRESETS[0].idea);
  const [extra, setExtra] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const set = <K extends keyof SongIdea>(k: K, v: SongIdea[K]) => setIdea((i) => ({ ...i, [k]: v }));

  const stylePrompt = useMemo(() => buildStylePrompt(idea), [idea]);

  const title = useMemo(() => {
    const m = output.match(/T[ÍI]TULO:\s*(.+)/i);
    return m?.[1]?.trim() || idea.theme.slice(0, 40);
  }, [output, idea.theme]);

  const generate = async () => {
    if (busy) return;
    if (!idea.theme.trim()) {
      toast.error("Escreva um tema (ou clique em Surpreenda-me)");
      return;
    }
    setBusy(true);
    setOutput("");
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await askAIStream(
        SONG_SYSTEM,
        `Componha uma música completa, original e profissional com base neste briefing:\n\n${buildSongBrief(idea, extra)}`,
        setOutput,
        ctrl.signal,
      );
      toast.success("Música gerada");
    } catch (e) {
      const msg = e instanceof AiError || e instanceof Error ? e.message : "Falha ao gerar";
      if (!ctrl.signal.aborted) toast.error(msg);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    setBusy(false);
    toast("Geração interrompida");
  };

  const surprise = () => {
    setIdea(randomIdea({ language: idea.language }));
    toast.success("Nova ideia gerada");
  };

  const newTheme = () => set("theme", randomTheme(idea.theme));

  const copy = async (text: string, what: string) => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${what} copiado`);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const save = () => {
    if (!output.trim()) return;
    try {
      saveProject({ title, artist: "Você", lyrics: output, status: "draft" });
      toast.success("Salvo no Dashboard");
    } catch {
      toast.error("Não foi possível salvar");
    }
  };

  const download = () => {
    try {
      downloadText(output, `${title.replace(/[^\w\s-]/g, "").slice(0, 40) || "musica"}.txt`);
    } catch {
      toast.error("Não foi possível baixar o arquivo");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Controls — simple by default */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Estilo em 1 clique</h4>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => { setIdea(p.idea); toast.success(`"${p.name}" carregado`); }}
                className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                  idea.genre === p.idea.genre
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10"
                }`}
              >
                {p.name}
              </button>
            ))}
            <button
              onClick={surprise}
              className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition"
            >
              <Shuffle className="h-3 w-3" /> Surpreenda-me
            </button>
          </div>
        </div>

        <Field label="Tema / história da música">
          <textarea
            value={idea.theme}
            onChange={(e) => set("theme", e.target.value)}
            placeholder="ex.: o cheiro do casaco dela ainda no banco do carro"
            className="mt-1 w-full h-20 resize-none rounded-lg border border-border bg-card p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </Field>
        <button onClick={newTheme} className="-mt-2 text-[11px] text-primary hover:underline">
          Sugerir outro tema humano
        </button>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Estilo / Gênero">
            <input list="sf-genres" value={idea.genre} onChange={(e) => set("genre", e.target.value)} className={inputCls} />
            <datalist id="sf-genres">{GENRES.map((g) => <option key={g} value={g} />)}</datalist>
          </Field>
          <Field label="Idioma">
            <select value={idea.language} onChange={(e) => set("language", e.target.value)} className={inputCls}>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
        </div>

        <button
          onClick={() => setAdvanced((a) => !a)}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <SlidersHorizontal className="h-3 w-3" /> {advanced ? "Ocultar ajustes avançados" : "Ajustes avançados"}
        </button>

        {advanced && (
          <div className="space-y-2 rounded-lg border border-border bg-card/50 p-2.5">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Clima">
                <input list="sf-moods" value={idea.mood} onChange={(e) => set("mood", e.target.value)} className={inputCls} />
                <datalist id="sf-moods">{MOODS.map((m) => <option key={m} value={m} />)}</datalist>
              </Field>
              <Field label="Voz">
                <input list="sf-voices" value={idea.voice} onChange={(e) => set("voice", e.target.value)} className={inputCls} />
                <datalist id="sf-voices">{VOICES.map((v) => <option key={v} value={v} />)}</datalist>
              </Field>
              <Field label="Andamento">
                <select
                  value={idea.tempo}
                  onChange={(e) => {
                    const t = TEMPOS.find((x) => x.label === e.target.value);
                    if (t) setIdea((i) => ({ ...i, tempo: t.label, bpm: t.bpm }));
                  }}
                  className={inputCls}
                >
                  {TEMPOS.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="BPM">
                <input type="number" min={40} max={220} value={idea.bpm}
                  onChange={(e) => set("bpm", Number(e.target.value) || 100)} className={inputCls} />
              </Field>
            </div>
            <Field label="Estrutura">
              <select value={idea.structure} onChange={(e) => set("structure", e.target.value)} className={inputCls}>
                {STRUCTURES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Instruções extras (opcional)">
              <input value={extra} onChange={(e) => setExtra(e.target.value)}
                placeholder="ex.: refrão com 4 palavras, citar o mar, sem clichês"
                className={inputCls} />
            </Field>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Prompt de estilo</span>
            <button onClick={() => copy(stylePrompt, "Prompt")} className="text-[11px] text-primary hover:underline">Copiar</button>
          </div>
          <p className="mt-1 text-xs text-foreground">{stylePrompt}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={generate} disabled={busy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Compondo…" : "Gerar música completa"}
          </button>
          {busy && (
            <button onClick={stop} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-muted">
              <Square className="h-3.5 w-3.5" /> Parar
            </button>
          )}
        </div>
      </div>

      {/* Output */}
      <div className="rounded-lg border border-border bg-card p-3 flex flex-col min-h-[28rem]">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground truncate">{output ? title : "Resultado"}</h4>
          <div className="flex gap-1.5">
            <button onClick={() => copy(output, "Letra")} disabled={!output} title="Copiar"
              className="rounded-md border border-border p-1.5 hover:border-primary/40 disabled:opacity-40"><Copy className="h-3.5 w-3.5" /></button>
            <button onClick={download} disabled={!output} title="Baixar"
              className="rounded-md border border-border p-1.5 hover:border-primary/40 disabled:opacity-40"><Download className="h-3.5 w-3.5" /></button>
            <button onClick={save} disabled={!output} title="Salvar"
              className="rounded-md border border-border p-1.5 hover:border-primary/40 disabled:opacity-40"><Save className="h-3.5 w-3.5" /></button>
            <button onClick={generate} disabled={busy} title="Gerar variação"
              className="rounded-md border border-border p-1.5 hover:border-primary/40 disabled:opacity-40"><Wand2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <pre className="flex-1 overflow-auto whitespace-pre-wrap font-body text-sm text-foreground">
          {output || "Escolha um estilo (Punk, Aura, Trap…), ajuste o tema e gere uma música completa: título, letra humana estruturada, prompt para Suno/Udio e tags."}
        </pre>
      </div>
    </div>
  );
};

export default SongGenerator;
