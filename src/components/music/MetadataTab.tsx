import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import { downloadText } from "@/lib/musicStore";
import { toast } from "sonner";

const MetadataTab = () => {
  const [form, setForm] = useState<Record<string, string>>({
    artist: "", title: "", album: "", isrc: "", upc: "", genre: "",
    releaseDate: "", language: "en", copyright: "", publisher: "",
  });
  const json = useMemo(() => JSON.stringify({
    format: "DDEX-lite",
    generatedAt: new Date().toISOString(),
    release: form,
  }, null, 2), [form]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-2">
        {Object.keys(form).map((k) => (
          <label key={k} className="block">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{k}</span>
            <input value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </label>
        ))}
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(json); toast.success("Copied"); }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40"><Copy className="h-3.5 w-3.5" /> Copy JSON</button>
          <button onClick={() => downloadText(json, "metadata.json")}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40"><Download className="h-3.5 w-3.5" /> Download</button>
        </div>
        <pre className="rounded-lg border border-border bg-card p-3 text-xs text-foreground whitespace-pre overflow-auto max-h-[24rem]">{json}</pre>
      </div>
    </div>
  );
};

export default MetadataTab;
