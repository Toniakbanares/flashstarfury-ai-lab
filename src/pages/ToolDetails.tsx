import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Bookmark, Check, ExternalLink, Heart, Share2, Star, TrendingUp,
} from "lucide-react";
import { shareLink } from "@/lib/share";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToolLikes } from "@/hooks/useToolLikes";
import { getSubmittedTools } from "@/lib/localStore";

type Tool = {
  id: string; slug: string | null; title: string; description: string;
  long_description: string | null; category: string; url: string;
  image_url: string | null; tier: string; is_featured: boolean;
  is_trending: boolean; is_new: boolean; benefits: string[] | null;
  tags: string[] | null; likes_count: number;
};

const ToolDetails = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [tool, setTool] = useState<Tool | null>(null);
  const [related, setRelated] = useState<Tool[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const { liked, toggle: toggleLike } = useToolLikes(tool ? [tool.id] : []);

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      // local submission first
      const local = getSubmittedTools().find(t => t.slug === slug || t.id === slug);
      if (local) {
        setTool({ ...local, long_description: null, benefits: null } as unknown as Tool);
        document.title = `${local.title} — AI Tool | PixelNova AI`;
        return;
      }
      let { data } = await supabase.from("offers").select("*").eq("slug", slug).maybeSingle();
      if (!data) {
        const r = await supabase.from("offers").select("*").eq("id", slug).maybeSingle();
        data = r.data;
      }
      if (!data) return;
      setTool(data as Tool);
      document.title = `${data.title} — AI Tool | PixelNova AI`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", data.description);
      supabase.rpc("increment_offer_views", { _offer_id: data.id });
      const { data: rel } = await supabase.from("offers").select("*")
        .eq("category", data.category).neq("id", data.id).limit(3);
      setRelated((rel as Tool[]) ?? []);
    };
    fetch();
  }, [slug]);

  useEffect(() => {
    if (!user || !tool) return;
    supabase.from("saved_offers").select("id").eq("user_id", user.id).eq("offer_id", tool.id).maybeSingle()
      .then(({ data }) => setIsSaved(!!data));
  }, [user, tool]);

  const handleSave = async () => {
    if (!user) { toast({ title: "Faça login para salvar" }); return; }
    if (!tool) return;
    if (isSaved) {
      await supabase.from("saved_offers").delete().eq("user_id", user.id).eq("offer_id", tool.id);
      setIsSaved(false);
    } else {
      await supabase.from("saved_offers").insert({ user_id: user.id, offer_id: tool.id });
      setIsSaved(true);
      toast({ title: "Salva nos favoritos ✨" });
    }
  };

  const handleVisit = () => {
    if (!tool) return;
    supabase.rpc("increment_offer_clicks", { _offer_id: tool.id });
  };

  if (!tool) return <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Loading tool...</div>;

  const slugFor = (t: Tool) => t.slug || t.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to tools
      </Link>

      <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{tool.category}</Badge>
          <Badge variant={tool.tier === "premium" ? "default" : "secondary"}>
            {tool.tier === "premium" ? "Paid" : "Free"}
          </Badge>
          {tool.is_featured && <Badge><Star className="h-3 w-3 mr-1" />Featured</Badge>}
          {tool.is_trending && <Badge variant="secondary"><TrendingUp className="h-3 w-3 mr-1" />Trending</Badge>}
          {tool.is_new && <Badge variant="secondary">New</Badge>}
        </div>

        <h1 className="font-heading text-3xl font-bold mb-3 gradient-text">{tool.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{tool.description}</p>

        {tool.image_url && (
          <div className="rounded-xl overflow-hidden border border-border mb-6 aspect-video bg-muted">
            <img src={tool.image_url} alt={`${tool.title} screenshot`} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}

        {tool.long_description && (
          <div className="mb-6 text-foreground leading-relaxed whitespace-pre-line">{tool.long_description}</div>
        )}

        {tool.benefits && tool.benefits.length > 0 && (
          <div className="mb-6">
            <h2 className="font-heading text-lg font-bold mb-3">Key Features</h2>
            <ul className="space-y-2">
              {tool.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {tool.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg" onClick={handleVisit}>
            <a href={tool.url} target="_blank" rel="noopener noreferrer sponsored">
              <ExternalLink className="h-4 w-4" /> Visit {tool.title}
            </a>
          </Button>
          <Button variant="outline" size="lg" onClick={handleSave}>
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-primary text-primary" : ""}`} /> {isSaved ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" size="lg" onClick={() => toggleLike(tool.id)}>
            <Heart className={`h-4 w-4 ${liked.has(tool.id) ? "fill-primary text-primary" : ""}`} /> Like
          </Button>
          <Button variant="outline" size="lg" onClick={() => shareLink(window.location.href, tool.title)}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold mb-4">Related tools</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map(r => (
              <Link key={r.id} to={`/tool/${slugFor(r)}`} className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all">
                <Badge variant="outline" className="text-[10px] mb-2">{r.category}</Badge>
                <h3 className="font-heading font-bold mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ToolDetails;
