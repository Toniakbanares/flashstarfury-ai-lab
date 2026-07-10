import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { askAI } from "@/lib/musicAi";
import { toast } from "sonner";
import { saveProject } from "@/lib/musicStore";

const FIELDS = [
  ["artist", "Artist"], ["title", "Track Title"], ["album", "Album"],
  ["writers", "Writers"], ["producers", "Producers"], ["genre", "Genre"],
  ["subgenre", "Subgenre"], ["releaseDate", "Release Date"], ["language", "Language"],
  ["copyright", "Copyright"], ["publisher", "Publisher"], ["isrc", "ISRC"], ["upc", "UPC"],
] as const;

type Form = Record<string, string>;

const PublishingAssistant = ({ onSaved }: { onSaved?: () => void } = {}) => {
  const [form, setForm] = useState<Form>({});
  const [busy, setBusy] = useState(false);
  const [content, setContent] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.title || !form.artist) { toast.error("Fill at least Artist and Title."); return; }
    setBusy(true);
    try {
      const meta = JSON.stringify(form, null, 2);
      const [spotify, apple, youtube, release, hashtags, seo] = await Promise.all([
        askAI("Write a concise, engaging Spotify artist bio-style description for this release (max 300 chars).", meta),
        askAI("Write a polished Apple Music release description (max 500 chars, editorial tone).", meta),
        askAI("Write a YouTube video description with credits, links placeholders, and 3 line breaks between sections.", meta),
        askAI("Write a press-release-style announcement (short, 3 paragraphs).", meta),
        askAI("Return 15 relevant marketing hashtags (space separated, all start with #).", meta),
        askAI("Return SEO meta as: Title: ...\nDescription: ...\nKeywords: comma,separated", meta),
      ]);
      setContent({ spotify, apple, youtube, release, hashtags, seo });
      saveProject({ title: form.title, artist: form.artist, publishing: form, status: "draft" });
      toast.success("Draft saved");
      onSaved?.();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    setBusy(false);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {FIELDS.map(([k, label]) => (
            <label key={k} className="block">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
              <input value={form[k] || ""} onChange={(e) => set(k, e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            </label>
          ))}
        </div>
        <button onClick={generate} disabled={busy}
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Generate release content
        </button>
      </div>
      <div className="space-y-3 max-h-[32rem] overflow-auto pr-1">
        {Object.entries(content).length === 0 && (
          <p className="text-xs text-muted-foreground">Fill the form and generate to see Spotify / Apple / YouTube / press / hashtags / SEO drafts here.</p>
        )}
        {Object.entries(content).map(([k, v]) => (
          <div key={k} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-primary">{k}</h4>
              <button onClick={() => { navigator.clipboard.writeText(v); toast.success("Copied"); }} className="text-[10px] text-muted-foreground hover:text-primary">Copy</button>
            </div>
            <pre className="text-xs text-foreground whitespace-pre-wrap font-body">{v}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublishingAssistant;
