import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Bookmark, Share2, Sparkles, Flame, TrendingUp } from "lucide-react";
import LeadCapturePopup from "@/components/LeadCapturePopup";
import { shareLink } from "@/lib/share";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Offer = {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  image_url: string | null;
  tier: string;
  is_featured: boolean;
  is_trending: boolean;
  is_new: boolean;
  tags: string[];
  likes_count: number;
};

const CATEGORIES = ["All", "AI Tools", "Free Resources", "Income Tools", "Courses", "Templates", "Automation"];

const Offerings = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filter, setFilter] = useState("All");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Make Money With AI — PixelNova AI Offerings";
    supabase.from("offers").select("*").eq("is_active", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false })
      .then(({ data }) => { setOffers((data as Offer[]) ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("saved_offers").select("offer_id").eq("user_id", user.id)
      .then(({ data }) => setSaved(new Set((data ?? []).map(d => d.offer_id))));
  }, [user]);

  const toggleSave = async (offerId: string) => {
    if (!user) { toast({ title: "Faça login para salvar ofertas" }); return; }
    if (saved.has(offerId)) {
      await supabase.from("saved_offers").delete().eq("user_id", user.id).eq("offer_id", offerId);
      setSaved(prev => { const n = new Set(prev); n.delete(offerId); return n; });
    } else {
      await supabase.from("saved_offers").insert({ user_id: user.id, offer_id: offerId });
      setSaved(prev => new Set(prev).add(offerId));
      toast({ title: "Salvo!" });
    }
  };

  const filtered = filter === "All" ? offers : offers.filter(o => o.category === filter);
  const featured = offers.filter(o => o.is_featured).slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <LeadCapturePopup />

      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
          <Sparkles className="h-3 w-3" /> AI Income Hub
        </div>
        <h1 className="font-heading text-4xl font-bold gradient-text mb-3">Make Money With AI</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Ferramentas, cursos e recursos selecionados para você gerar renda com inteligência artificial.</p>
      </header>

      {featured.length > 0 && (
        <section className="mb-10">
          <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2"><Flame className="h-5 w-5 text-primary" /> Featured Income Tools</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map(o => (
              <Link key={o.id} to={`/offer/${o.id}`} className="group rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 hover:border-primary transition-all">
                <Badge className="mb-2">Featured</Badge>
                <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary">{o.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{o.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}>
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando ofertas...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">Nenhuma oferta nesta categoria ainda.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(o => (
            <article key={o.id} className={`rounded-2xl border bg-card p-5 flex flex-col hover:border-primary/50 transition-all ${o.is_featured ? "ring-1 ring-primary/30" : "border-border"}`}>
              <div className="flex items-start justify-between mb-2 gap-2">
                <Badge variant="outline" className="text-[10px]">{o.category}</Badge>
                <div className="flex gap-1">
                  {o.is_new && <Badge className="text-[10px] bg-blue-500">New</Badge>}
                  {o.is_trending && <Badge className="text-[10px] bg-orange-500"><TrendingUp className="h-2.5 w-2.5 mr-0.5" />Hot</Badge>}
                  <Badge variant={o.tier === "premium" ? "default" : "secondary"} className="text-[10px]">{o.tier === "premium" ? "Premium" : "Free"}</Badge>
                </div>
              </div>

              <h3 className="font-heading font-bold text-base mb-1.5">{o.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{o.description}</p>

              <div className="flex gap-2 mb-2">
                <Button asChild size="sm" className="flex-1">
                  <a href={o.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" />Access Tool</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/offer/${o.id}`}>Learn More</Link>
                </Button>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <button onClick={() => toggleSave(o.id)} className="flex items-center gap-1 hover:text-primary">
                  <Bookmark className={`h-3.5 w-3.5 ${saved.has(o.id) ? "fill-primary text-primary" : ""}`} /> Save
                </button>
                <button onClick={() => shareLink(`${window.location.origin}/offer/${o.id}`, o.title)} className="flex items-center gap-1 hover:text-primary">
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offerings;
