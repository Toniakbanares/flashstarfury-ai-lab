import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Bookmark, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

type Tool = {
  id: string; slug: string | null; title: string; description: string;
  category: string; url: string; tier: string; image_url: string | null;
};

const Favorites = () => {
  const { user, loading } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    document.title = "My Favorite AI Tools — PixelNova AI";
    if (!user) return;
    supabase.from("saved_offers").select("offer_id, offers(*)").eq("user_id", user.id)
      .then(({ data }) => {
        const list = (data ?? []).map((r: any) => r.offers).filter(Boolean) as Tool[];
        setTools(list);
        setBusy(false);
      });
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
          <Bookmark className="h-3 w-3" /> Favorites
        </div>
        <h1 className="font-heading text-3xl font-bold gradient-text">My Favorite Tools</h1>
        <p className="text-muted-foreground mt-2">Your saved AI tools, in one place.</p>
      </header>

      {busy ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : tools.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">You haven't saved any tools yet.</p>
          <Button asChild><Link to="/tools">Browse tools</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(t => (
            <article key={t.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col hover:border-primary/50 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                <Badge variant={t.tier === "premium" ? "default" : "secondary"} className="text-[10px]">
                  {t.tier === "premium" ? "Paid" : "Free"}
                </Badge>
              </div>
              <Link to={`/tool/${t.slug || t.id}`} className="hover:text-primary">
                <h3 className="font-heading font-bold text-base mb-1.5">{t.title}</h3>
              </Link>
              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{t.description}</p>
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1">
                  <a href={t.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" />Visit</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/tool/${t.slug || t.id}`}>Details</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
