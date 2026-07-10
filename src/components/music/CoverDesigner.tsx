import { useState } from "react";
import { Loader2, Download, Sparkles } from "lucide-react";
import { generateCover } from "@/lib/musicAi";
import { downloadBlob, saveProject } from "@/lib/musicStore";
import { toast } from "sonner";

const CoverDesigner = () => {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!prompt.trim()) { toast.error("Describe the cover art."); return; }
    setBusy(true); setUrl("");
    try {
      const res = await generateCover(`Square album cover artwork, professional, high detail: ${prompt}`);
      if (res.imageUrl) setUrl(res.imageUrl);
      else toast.error(res.error || "No image returned");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    setBusy(false);
  };

  const download = async () => {
    if (!url) return;
    try {
      const r = await fetch(url); const blob = await r.blob();
      downloadBlob(blob, "album-cover.png");
      saveProject({ title: prompt.slice(0, 40) || "Cover", artist: "You", coverUrl: url, status: "draft" });
    } catch { toast.error("Download failed"); }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. moody synthwave portrait, neon magenta light, film grain"
          className="w-full h-32 rounded-lg border border-border bg-card p-3 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
        <button onClick={run} disabled={busy}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate cover
        </button>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 aspect-square flex items-center justify-center overflow-hidden">
        {busy ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> :
          url ? (
            <div className="relative w-full h-full">
              <img src={url} alt="Cover" className="w-full h-full object-cover rounded" />
              <button onClick={download} className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-background/90 px-2 py-1 text-xs font-medium hover:bg-background"><Download className="h-3 w-3" /> Save</button>
            </div>
          ) : <p className="text-xs text-muted-foreground">Square 1024×1024 cover will appear here.</p>}
      </div>
    </div>
  );
};

export default CoverDesigner;
