import { useEffect, useState } from "react";
import { BookOpen, Download, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteLyric, listLyrics, saveLyric, SavedLyric } from "@/lib/lyricsLibrary";
import { downloadText } from "@/lib/musicStore";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "letra";

const LyricsLibrary = () => {
  const [items, setItems] = useState<SavedLyric[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const [ver, setVer] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const refresh = () => setItems(listLyrics());
  useEffect(refresh, []);

  const sel = items.find((i) => i.id === selId) || null;

  const open = (l: SavedLyric, v?: number) => {
    const version = l.versions.find((x) => x.version === v) || l.versions[l.versions.length - 1];
    setSelId(l.id);
    setVer(version.version);
    setTitle(l.title);
    setText(version.text);
  };

  const save = () => {
    if (!text.trim()) return toast.error("A letra está vazia");
    const saved = saveLyric(title, text, selId || undefined);
    refresh();
    setSelId(saved.id);
    setVer(saved.versions[saved.versions.length - 1].version);
    toast.success(`Salvo como versão ${saved.versions.length}`);
  };

  const download = () => {
    if (!text.trim()) return;
    downloadText(`${title}\n\n${text}`, `${slug(title)}-v${ver}.txt`);
  };

  const remove = (id: string) => {
    if (!confirm("Excluir esta letra e todas as versões?")) return;
    deleteLyric(id);
    if (id === selId) { setSelId(null); setTitle(""); setText(""); }
    refresh();
  };

  const newLyric = () => { setSelId(null); setTitle(""); setText(""); setVer(1); };

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-border bg-card p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Minhas letras</h3>
          <button onClick={newLyric} className="text-xs text-primary hover:underline">+ Nova</button>
        </div>
        {items.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma letra salva ainda. Use "Salvar" no Compositor ou no Gerador.</p>}
        {items.map((l) => (
          <div key={l.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer ${l.id === selId ? "bg-primary/15" : "hover:bg-muted"}`} onClick={() => open(l)}>
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground">{l.title}</p>
              <p className="text-[11px] text-muted-foreground">v{l.versions.length} · {new Date(l.updatedAt).toLocaleDateString()}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); remove(l.id); }} aria-label="Excluir" className="p-1 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </aside>

      <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da música"
            className="flex-1 min-w-[160px] bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
          {sel && (
            <select value={ver} onChange={(e) => open(sel, Number(e.target.value))} aria-label="Versão"
              className="bg-background border border-border rounded-lg px-2 py-2 text-sm">
              {sel.versions.map((v) => (
                <option key={v.version} value={v.version}>Versão {v.version} — {new Date(v.savedAt).toLocaleString()}</option>
              ))}
            </select>
          )}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva ou cole sua letra aqui…"
          className="w-full h-[420px] bg-background border border-border rounded-lg p-3 text-sm font-mono outline-none focus:border-primary resize-y" />
        <div className="flex gap-2 justify-end">
          <button onClick={download} disabled={!text.trim()} className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-40">
            <Download className="h-4 w-4" /> Baixar .txt
          </button>
          <button onClick={save} className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm hover:opacity-90">
            <Save className="h-4 w-4" /> {selId ? "Salvar nova versão" : "Salvar"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LyricsLibrary;
