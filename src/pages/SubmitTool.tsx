import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { addSubmittedTool } from "@/lib/localStore";

const CATEGORIES = ["AI Image", "AI Video", "AI Writing", "Automation", "Marketing", "Income"];

const schema = z.object({
  title: z.string().trim().min(2, "Min 2 chars").max(80),
  description: z.string().trim().min(10, "Min 10 chars").max(500),
  url: z.string().trim().url("Must be a valid URL").max(500),
  category: z.string().min(1, "Pick a category"),
  image_url: z.string().trim().url("Invalid URL").max(500).or(z.literal("")),
  tags: z.string().max(200),
  tier: z.enum(["free", "premium"]),
});

const SubmitTool = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", url: "", category: "AI Image",
    image_url: "", tags: "", tier: "free" as "free" | "premium",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach(i => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 8);
    const tool = addSubmittedTool({
      title: parsed.data.title,
      description: parsed.data.description,
      url: parsed.data.url,
      category: parsed.data.category,
      image_url: parsed.data.image_url || null,
      tags,
      tier: parsed.data.tier,
    });
    toast({ title: "Tool submitted ✨", description: "Your tool now appears in /tools." });
    navigate(`/tool/${tool.slug}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
          <Plus className="h-3 w-3" /> Submit Tool
        </div>
        <h1 className="font-heading text-3xl font-bold gradient-text">Add your AI tool</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Share an AI tool with the PixelNova community. Submissions appear instantly in the marketplace.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
        <div>
          <Label htmlFor="title">Tool name *</Label>
          <Input id="title" value={form.title} onChange={e => update("title", e.target.value)}
            placeholder="e.g. PixelMagic AI" maxLength={80} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" value={form.description} onChange={e => update("description", e.target.value)}
            placeholder="What does it do? Who is it for?" rows={4} maxLength={500} />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
        </div>

        <div>
          <Label htmlFor="url">Website URL *</Label>
          <Input id="url" type="url" value={form.url} onChange={e => update("url", e.target.value)}
            placeholder="https://yourtool.com" maxLength={500} />
          {errors.url && <p className="text-xs text-destructive mt-1">{errors.url}</p>}
        </div>

        <div>
          <Label>Category *</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CATEGORIES.map(c => (
              <button type="button" key={c} onClick={() => update("category", c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.category === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <div>
          <Label>Pricing</Label>
          <div className="flex gap-2 mt-2">
            {(["free", "premium"] as const).map(t => (
              <button type="button" key={t} onClick={() => update("tier", t)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  form.tier === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}>
                {t === "free" ? "Free" : "Paid"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="image_url">Image / logo URL</Label>
          <Input id="image_url" type="url" value={form.image_url} onChange={e => update("image_url", e.target.value)}
            placeholder="https://..." maxLength={500} />
          {errors.image_url && <p className="text-xs text-destructive mt-1">{errors.image_url}</p>}
        </div>

        <div>
          <Label htmlFor="tags">Tags <span className="text-muted-foreground">(comma separated)</span></Label>
          <Input id="tags" value={form.tags} onChange={e => update("tags", e.target.value)}
            placeholder="image, generator, free" maxLength={200} />
          {form.tags && (
            <div className="flex gap-1 flex-wrap mt-2">
              {form.tags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 8).map(t => (
                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Featured placement available soon
          </p>
          <Button type="submit"><Send className="h-4 w-4" /> Submit Tool</Button>
        </div>
      </form>
    </div>
  );
};

export default SubmitTool;
