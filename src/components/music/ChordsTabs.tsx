import { useState } from "react";
import { Loader2, Music, Guitar, Activity } from "lucide-react";
import { askAI } from "@/lib/musicAi";
import { toast } from "sonner";

const ChordsTabs = () => {
  const [theme, setTheme] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (kind: "progression" | "tab" | "key" | "harmony") => {
    if (!theme.trim()) { toast.error("Describe the mood, genre or key first."); return; }
    setBusy(kind);
    const prompts: Record<string, string> = {
      progression: "Suggest 3 chord progressions (4 chords each) in different keys for the described song. Format:\nKey — chord1 chord2 chord3 chord4",
      tab: "Provide a simple 6-line ASCII guitar tab (about 8 bars) for the described song. Use standard tuning EADGBE with fret numbers.",
      key: "Suggest the best musical key and tempo (BPM) for the described song. Format:\nKey: X\nBPM: Y\nMode: major/minor\nReason: one sentence.",
      harmony: "Suggest vocal harmony intervals (3rds, 5ths) for the described song, with a short example.",
    };
    try {
      const res = await askAI(prompts[kind], theme);
      setOutput(res);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    setBusy(null);
  };

  return (
    <div className="space-y-4">
      <input value={theme} onChange={(e) => setTheme(e.target.value)}
        placeholder="e.g. melancholic indie folk in minor, mid-tempo"
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
      <div className="flex flex-wrap gap-2">
        {[
          { id: "progression" as const, label: "Chord Progressions", icon: Music },
          { id: "tab" as const, label: "Simple Tab", icon: Guitar },
          { id: "key" as const, label: "Key + BPM", icon: Activity },
          { id: "harmony" as const, label: "Harmony", icon: Music },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => run(id)} disabled={!!busy}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40 disabled:opacity-50">
            {busy === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />} {label}
          </button>
        ))}
      </div>
      <pre className="rounded-lg border border-border bg-card p-3 text-sm text-foreground whitespace-pre-wrap font-mono min-h-[12rem]">{output || "Chord suggestions, tab, key & BPM will appear here."}</pre>
    </div>
  );
};

export default ChordsTabs;
