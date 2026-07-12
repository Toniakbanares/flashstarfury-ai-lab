import { useMemo, useState } from "react";
import { FileText, FileDown, FileType, Mic, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadBlob, downloadText } from "@/lib/musicStore";
import { askAI } from "@/lib/musicAi";

// Rough syllable counter (English-focused heuristic; works OK across latin languages)
const countSyllables = (word: string): number => {
  const w = word.toLowerCase().replace(/[^a-záéíóúàèìòùâêîôûãõñ]/g, "");
  if (!w) return 0;
  const groups = w.match(/[aeiouáéíóúàèìòùâêîôûãõ]+/g);
  let n = groups ? groups.length : 1;
  if (w.endsWith("e") && n > 1) n -= 1;
  return Math.max(1, n);
};

const detectLanguage = (text: string): string => {
  const t = text.toLowerCase();
  if (/[ñ¿¡]|(?:\b(?:el|la|los|las|de|que|con|una?)\b)/.test(t)) return "Spanish";
  if (/[ãõç]|(?:\b(?:não|você|também|então|para|com)\b)/.test(t)) return "Portuguese";
  if (/[àâçéèêëîïôûù]|(?:\b(?:le|les|des|une?|avec|pour|dans)\b)/.test(t)) return "French";
  if (/[äöüß]|(?:\b(?:der|die|das|und|nicht|mit|für)\b)/.test(t)) return "German";
  return "English";
};

const LyricsTools = () => {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/) : [];
    const lines = text.trim() ? text.trim().split(/\n+/) : [];
    const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
    return { words: words.length, lines: lines.length, syllables, language: text.trim() ? detectLanguage(text) : "—" };
  }, [text]);

  const exportPDF = async () => {
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(text || "(empty)", 180);
      doc.setFont("helvetica", "normal"); doc.setFontSize(12);
      doc.text(lines, 15, 20);
      downloadBlob(doc.output("blob"), "lyrics.pdf");
    } catch (e) { toast.error("PDF export failed"); }
    setBusy(false);
  };

  const exportDOCX = async () => {
    setBusy(true);
    try {
      const { Document, Packer, Paragraph, TextRun } = await import("docx");
      const doc = new Document({
        sections: [{ children: text.split("\n").map((l) => new Paragraph({ children: [new TextRun(l || " ")] })) }],
      });
      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, "lyrics.docx");
    } catch (e) { toast.error("DOCX export failed"); }
    setBusy(false);
  };

  const exportTXT = () => downloadText(text || "", "lyrics.txt");

  const transcribe = async (file: File) => {
    if (file.size < 1024) { toast.error("Audio file looks empty. Please record again."); return; }
    if (file.size > 24 * 1024 * 1024) { toast.error("Audio too large (max 24MB). Split it into shorter clips."); return; }
    setTranscribing(true);
    const toastId = toast.loading("Transcribing audio…");
    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
      const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const fd = new FormData();
      fd.append("file", file, file.name || "audio.webm");
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/transcribe-audio`, {
        method: "POST",
        headers: { Authorization: `Bearer ${SUPABASE_KEY}` },
        body: fd,
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || !data?.text) {
        toast.error(data?.error || `Transcription failed (${resp.status})`, { id: toastId });
        return;
      }
      setText((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
      toast.success(data.mock ? "Mock transcript inserted (no API key set)" : "Transcript inserted", { id: toastId });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transcription failed", { id: toastId });
    } finally {
      setTranscribing(false);
    }
  };

  const improveWithAI = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await askAI("Analyze these lyrics briefly: mood, meter, suggestions (max 5 bullets).", text);
      toast.success("Analysis ready"); setText(text + "\n\n---\nAI Analysis:\n" + res);
    } catch (e) { toast.error("Failed"); }
    setBusy(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write your lyrics here…"
          className="w-full h-64 rounded-lg border border-border bg-card p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex flex-wrap gap-2">
          <button onClick={exportTXT} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40"><FileText className="h-3.5 w-3.5" /> TXT</button>
          <button onClick={exportPDF} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40 disabled:opacity-50"><FileDown className="h-3.5 w-3.5" /> PDF</button>
          <button onClick={exportDOCX} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40 disabled:opacity-50"><FileType className="h-3.5 w-3.5" /> DOCX</button>
          <button onClick={improveWithAI} disabled={busy} className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "AI Analyze"}
          </button>
          <label className="flex items-center gap-1.5 rounded-lg border border-dashed border-border bg-card px-3 py-2 text-xs font-medium cursor-pointer hover:border-primary/40">
            {transcribing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic className="h-3.5 w-3.5" />} Transcribe audio
            <input type="file" accept="audio/*" hidden onChange={(e) => e.target.files?.[0] && transcribe(e.target.files[0])} />
          </label>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 h-fit">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stats</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Language</span><span className="text-foreground font-medium">{stats.language}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Lines</span><span className="text-foreground font-medium">{stats.lines}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Words</span><span className="text-foreground font-medium">{stats.words}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Syllables</span><span className="text-foreground font-medium">{stats.syllables}</span></div>
        </div>
      </div>
    </div>
  );
};

export default LyricsTools;
