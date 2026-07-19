import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Bookmark, ExternalLink, Flame, Heart, Search, Share2, Sparkles, Star,
  TrendingUp, Plus, Wrench
} from "lucide-react";
import AILabSection from "@/components/AILabSection";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import { shareLink } from "@/lib/share";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToolLikes } from "@/hooks/useToolLikes";
import { getSubmittedTools, savedToolsStore, STORE_EVENT } from "@/lib/localStore";
import { Skeleton } from "@/components/ui/skeleton";

type Tool = {
  id: string; slug: string | null; title: string; description: string;
  category: string; url: string; image_url: string | null; tier: string;
  is_featured: boolean; is_trending: boolean; is_new: boolean;
  tags: string[] | null; likes_count: number; clicks_count: number;
  views_count: number; created_at: string;
};

const CATEGORIES = [
  "All", "AI Image", "AI Video", "AI Writing", "Automation",
  "Marketing", "Income", "Free", "Paid",
];

type Sort = "trending" | "popular" | "newest" | "featured" | "free" | "paid";
const SORTS: { id: Sort; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "featured", label: "Featured" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
];

const Tools = () => {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState<Sort>("trending");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const { liked, toggle: toggleLike } = useToolLikes(tools.map(t => t.id));

  useEffect(() => {
    document.title = "AI Tools Marketplace — StarFury AI";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Discover the best AI tools — image, video, writing, automation, marketing & income. Curated marketplace by StarFury AI.");
    supabase.from("offers").select("*").eq("is_active", true)
      .then(({ data }) => {
        const remote = (data as Tool[]) ?? [];
        const local = getSubmittedTools() as unknown as Tool[];
        setTools([...local, ...remote]);
        setLoading(false);
      });
    const onStore = () => {
      setTools(prev => {
        const remote = prev.filter(t => !t.id.startsWith("local_"));
        const local = getSubmittedTools() as unknown as Tool[];
        return [...local, ...remote];
      });
    };
    window.addEventListener(STORE_EVENT, onStore);
    return () => window.removeEventListener(STORE_EVENT, onStore);
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from("saved_offers").select("offer_id").eq("user_id", user.id)
        .then(({ data }) => {
          const remote = new Set((data ?? []).map(d => d.offer_id));
          const local = savedToolsStore.get();
          local.forEach(id => remote.add(id));
          setSaved(remote);
        });
    } else {
      setSaved(savedToolsStore.get());
    }
  }, [user]);

  const toggleSave = async (id: string) => {
    const next = savedToolsStore.toggle(id);
    setSaved(new Set(next));
    if (user && !id.startsWith("local_")) {
      if (next.has(id)) await supabase.from("saved_offers").insert({ user_id: user.id, offer_id: id });
      else await supabase.from("saved_offers").delete().eq("user_id", user.id).eq("offer_id", id);
    }
    toast({ title: next.has(id) ? "Saved ✨" : "Removed" });
  };

  const handleVisit = (t: Tool) => {
    // fire-and-forget click tracking
    supabase.rpc("increment_offer_clicks", { _offer_id: t.id });
  };

  const filtered = useMemo(() => {
    let list = [...tools];
    if (filter !== "All") {
      if (filter === "Free") list = list.filter(t => t.tier !== "premium");
      else if (filter === "Paid") list = list.filter(t => t.tier === "premium");
      else list = list.filter(t => t.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.tags ?? []).some(tag => tag.toLowerCase().includes(q))
      );
    }
    switch (sort) {
      case "trending":
        list.sort((a, b) =>
          (b.likes_count + b.clicks_count + b.views_count) -
          (a.likes_count + a.clicks_count + a.views_count));
        break;
      case "popular":
        list.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case "newest":
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "featured":
        list = list.filter(t => t.is_featured);
        break;
      case "free":
        list = list.filter(t => t.tier !== "premium");
        break;
      case "paid":
        list = list.filter(t => t.tier === "premium");
        break;
    }
    return list;
  }, [tools, filter, sort, search]);

  const featured = useMemo(
    () => tools.filter(t => t.is_featured).slice(0, 6),
    [tools]
  );

  const slugFor = (t: Tool) => t.slug || t.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <LeadCapturePopup />

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
            <Wrench className="h-3 w-3" /> AI Tools Marketplace
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold gradient-text">Discover the Best AI Tools</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Curated directory of image, video, writing, automation & income AI tools — ranked by community.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/submit"><Plus className="h-4 w-4" /> Submit Tool</Link>
        </Button>
      </header>

      {/* Built-in lab */}
      <section className="mb-12">
        <AILabSection />
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-8">
          <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" /> Featured Tools
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map(t => (
              <Link
                key={t.id} to={`/tool/${slugFor(t)}`}
                className="group rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 hover:border-primary transition-all"
              >
                <Badge className="mb-2"><Star className="h-3 w-3 mr-1" />Featured</Badge>
                <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary">{t.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tools by name, category or tag..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SORTS.map(s => (
            <button
              key={s.id} onClick={() => setSort(s.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                sort === s.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="aspect-video w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          No tools match these filters yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(t => (
            <article
              key={t.id}
              className={`rounded-2xl border bg-card p-5 flex flex-col hover:border-primary/50 transition-all ${
                t.is_featured ? "ring-1 ring-primary/30 border-primary/30" : "border-border"
              }`}
            >
              {t.image_url && (
                <Link to={`/tool/${slugFor(t)}`} className="block aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                  <img
                    src={t.image_url} alt={t.title} loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </Link>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                <div className="flex flex-wrap gap-1 justify-end">
                  {t.is_featured && <Badge className="text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" />Featured</Badge>}
                  {t.is_new && <Badge variant="secondary" className="text-[10px]">New</Badge>}
                  {t.is_trending && <Badge variant="secondary" className="text-[10px]"><TrendingUp className="h-2.5 w-2.5 mr-0.5" />Hot</Badge>}
                  <Badge variant={t.tier === "premium" ? "default" : "secondary"} className="text-[10px]">
                    {t.tier === "premium" ? "Paid" : "Free"}
                  </Badge>
                </div>
              </div>

              <Link to={`/tool/${slugFor(t)}`} className="hover:text-primary transition-colors">
                <h3 className="font-heading font-bold text-base mb-1.5">{t.title}</h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{t.description}</p>

              <div className="flex gap-2 mb-3">
                <Button asChild size="sm" className="flex-1" onClick={() => handleVisit(t)}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer sponsored">
                    <ExternalLink className="h-3 w-3" /> Visit Tool
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/tool/${slugFor(t)}`}>Details</Link>
                </Button>
              </div>

              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <button onClick={() => toggleLike(t.id)} className="flex items-center gap-1 hover:text-primary">
                  <Heart className={`h-3.5 w-3.5 ${liked.has(t.id) ? "fill-primary text-primary" : ""}`} />
                  <span>{t.likes_count + (liked.has(t.id) && !t.likes_count ? 1 : 0)}</span>
                </button>
                <button onClick={() => toggleSave(t.id)} className="flex items-center gap-1 hover:text-primary">
                  <Bookmark className={`h-3.5 w-3.5 ${saved.has(t.id) ? "fill-primary text-primary" : ""}`} /> Save
                </button>
                <button
                  onClick={() => shareLink(`${window.location.origin}/tool/${slugFor(t)}`, t.title)}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground mt-10 flex items-center justify-center gap-1">
        <Sparkles className="h-3 w-3" /> Want to feature your tool? Sponsored placement coming soon.
      </p>
    </div>
  );
};

export default Tools;
