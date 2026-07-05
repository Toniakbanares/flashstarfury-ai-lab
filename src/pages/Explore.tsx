import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Clock, Flame, Loader2, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLikes } from "@/hooks/useLikes";
import { CATEGORY_FILTERS } from "@/lib/templates";
import CreationCard from "@/components/CreationCard";
import { getLocalCreations, likeLocalCreation, STORE_EVENT } from "@/lib/localStore";
import { DEMO_CREATIONS } from "@/lib/demoCreations";

type Tab = "trending" | "latest" | "popular";
type Category = typeof CATEGORY_FILTERS[number]["id"];

const PAGE_SIZE = 24;

const Explore = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<any[]>([]);
  const [localCreations, setLocalCreations] = useState<any[]>(() => getLocalCreations());
  const [tab, setTab] = useState<Tab>("trending");
  const [category, setCategory] = useState<Category>("all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [search]);

  // Listen for new local creations
  useEffect(() => {
    const refresh = () => setLocalCreations(getLocalCreations());
    window.addEventListener(STORE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(STORE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Merge DB + local (+ demo seed if there is no real content), filter by category & search, sort by tab
  const merged = useMemo(() => {
    const real = [...localCreations, ...generations];
    const base = real.length === 0 ? [...DEMO_CREATIONS] : real;
    let filtered = category === "all" ? base : base.filter((g) => g.tool_type === category);
    if (debounced) {
      filtered = filtered.filter((g) => (g.prompt || "").toLowerCase().includes(debounced));
    }
    if (tab === "latest") {
      return [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return [...filtered].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
  }, [localCreations, generations, category, tab, debounced]);

  const ids = useMemo(() => merged.map(g => g.id), [merged]);
  const { liked, toggle } = useLikes(ids);

  const fetchPage = useCallback(async (reset: boolean) => {
    setLoading(true);
    let query = supabase
      .from("generations")
      .select("*, profiles(display_name, avatar_url)")
      .eq("is_public", true);

    if (category !== "all") query = query.eq("tool_type", category);

    if (tab === "trending") {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since).order("likes_count", { ascending: false }).order("created_at", { ascending: false });
    } else if (tab === "popular") {
      query = query.order("likes_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const from = reset ? 0 : page * PAGE_SIZE;
    const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
    setLoading(false);
    if (error) { toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" }); return; }
    if (!data) return;
    setGenerations(prev => reset ? data : [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    setPage(reset ? 1 : page + 1);
  }, [tab, category, page, toast]);

  useEffect(() => {
    setPage(0); setHasMore(true);
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) fetchPage(false);
    }, { rootMargin: "400px" });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [fetchPage, hasMore, loading]);

  const handleLike = async (genId: string) => {
    // Local creations: bump local likes counter only
    if (typeof genId === "string" && genId.startsWith("loc_")) {
      likeLocalCreation(genId);
      setLocalCreations(getLocalCreations());
      return;
    }
    const result = await toggle(genId);
    if (!result) return;
    const delta = result === "liked" ? 1 : -1;
    setGenerations(prev => prev.map(g => g.id === genId ? { ...g, likes_count: Math.max(0, g.likes_count + delta) } : g));
  };

  const useTemplate = (prompt: string) => {
    navigate(`/tools?tool=image&prompt=${encodeURIComponent(prompt)}`);
  };

  const tabs: { id: Tab; label: string; icon: typeof TrendingUp }[] = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "latest", label: "Recentes", icon: Clock },
    { id: "popular", label: "Populares", icon: Flame },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-bold gradient-text mb-1">Discover AI Creations</h1>
        <p className="text-sm text-muted-foreground">Explore, curta e remixe criações da comunidade PixelNova AI.</p>
      </header>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts…"
          aria-label="Search creations"
          className="w-full bg-card border border-border rounded-lg pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Templates removed per user request */}

      {/* Tabs + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <t.icon className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {CATEGORY_FILTERS.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${category === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {merged.length === 0 && !loading ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhuma criação ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {merged.map(gen => (
            <CreationCard key={gen.id} gen={gen} isLiked={liked.has(gen.id)} onLike={handleLike} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-10" />
      {loading && (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      )}
      {!hasMore && merged.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">Você chegou ao fim ✨</p>
      )}
    </div>
  );
};

export default Explore;
