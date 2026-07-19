import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, ExternalLink } from "lucide-react";

type Offer = { id: string; title: string; description: string; category: string; url: string; tier: string };

const SavedOffers = () => {
  const { user, loading: authLoading } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Saved Offers — StarFury AI";
    if (!user) return;
    supabase.from("saved_offers").select("offer_id, offers(*)").eq("user_id", user.id)
      .then(({ data }) => {
        setOffers(((data ?? []).map((d: { offers: Offer | null }) => d.offers).filter(Boolean) as Offer[]));
        setLoading(false);
      });
  }, [user]);

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="font-heading text-3xl font-bold gradient-text mb-2 flex items-center gap-2">
        <Bookmark className="h-7 w-7" /> Ofertas Salvas
      </h1>
      <p className="text-muted-foreground mb-6">Suas ferramentas e recursos favoritos.</p>

      {loading ? (
        <div className="text-center text-muted-foreground py-12">Carregando...</div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Você ainda não salvou nenhuma oferta.</p>
          <Button asChild><Link to="/offerings">Explorar ofertas</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map(o => (
            <article key={o.id} className="rounded-2xl border border-border bg-card p-5 flex flex-col">
              <div className="flex gap-2 mb-2">
                <Badge variant="outline" className="text-[10px]">{o.category}</Badge>
                <Badge variant={o.tier === "premium" ? "default" : "secondary"} className="text-[10px]">{o.tier === "premium" ? "Premium" : "Free"}</Badge>
              </div>
              <h3 className="font-heading font-bold mb-1">{o.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{o.description}</p>
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1"><a href={o.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3 w-3" />Acessar</a></Button>
                <Button asChild size="sm" variant="outline"><Link to={`/offer/${o.id}`}>Detalhes</Link></Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedOffers;
