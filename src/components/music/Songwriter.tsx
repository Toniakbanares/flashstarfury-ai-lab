import { useState } from "react";
import { Loader2, Sparkles, Wand2, Music2, Languages } from "lucide-react";
import { askAI } from "@/lib/musicAi";
import { toast } from "sonner";
import { saveProject } from "@/lib/musicStore";

const ACTIONS = [
  { id: "write", label: "Write Lyrics", icon: Sparkles, system: "You are a professional songwriter. Write original, emotive song lyrics with clear verse/chorus structure. Output only the lyrics, no commentary." },
  { id: "improve", label: "Improve", icon: Wand2, system: "You are a lyric editor. Improve the given lyrics: sharpen imagery, fix awkward lines, keep meaning. Output only revised lyrics." },
  { id: "rhymes", label: "Rhyme Assistant", icon: Music2, system: "You are a rhyming dictionary. Given a word or phrase, return 15 perfect and slant rhymes as a comma-separated list." },
  { id: "verse", label: "Verse Builder", icon: Sparkles, system: "Generate 1 verse (4 lines) inspired by the input theme. Output only the verse." },
  { id: "chorus", label: "Chorus Builder", icon: Sparkles, system: "Generate 1 catchy chorus (4 lines) for the input theme. Output only the chorus." },
  { id: "translate", label: "Translate", icon: Languages, system: "Translate the given lyrics preserving rhyme where possible. Detect target language from the input like 'to Spanish:' or default to English." },
];

const Songwriter = () => {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (action: typeof ACTIONS[number]) => {
    if (!prompt.trim()) { toast.error("Enter a theme, lyrics or a word first."); return; }
    setBusy(action.id); setOutput("");
    try {
      const res = await askAI(action.system, prompt);
      setOutput(res);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(null); }
  };

  const save = () => {
    if (!output.trim()) return;
    saveProject({ title: prompt.slice(0, 40) || "Song draft", artist: "You", lyrics: output, status: "draft" });
    toast.success("Saved to Dashboard");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Theme, existing lyrics, or a word to rhyme…"
          className="w-full h-48 rounded-lg border border-border bg-card p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACTIONS.map((a) => (
            <button key={a.id} onClick={() => run(a)} disabled={!!busy}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-primary/10 transition disabled:opacity-50">
              {busy === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <a.icon className="h-3.5 w-3.5" />}
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 min-h-[15rem] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Result</h4>
          <button onClick={save} disabled={!output} className="text-xs text-primary hover:underline disabled:opacity-40">Save to Dashboard</button>
        </div>
        <pre className="text-sm text-foreground whitespace-pre-wrap font-body flex-1 overflow-auto">{output || "Your generated lyrics will appear here."}</pre>
      </div>
    </div>
  );
};

export default Songwriter;
