import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, ExternalLink, Share2 } from "lucide-react";
import { shareLink } from "@/lib/share";

type Offer = {
  id: string; title: string; description: string; long_description: string | null;
  category: string; url: string; image_url: string | null; tier: string;
  is_featured: boolean; benefits: string[]; tags: string[];
};

const OfferDetails = () => {
  const { id } = useParams();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [related, setRelated] = useState<Offer[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from("offers").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setOffer(data as Offer);
        document.title = `${data.title} — PixelNova AI Offerings`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", data.description);
        supabase.from("offers").select("*").eq("category", data.category).neq("id", id).limit(3)
          .then(({ data: rel }) => setRelated((rel as Offer[]) ?? []));
      }
    });
  }, [id]);

  if (!offer) return <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/offerings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar para ofertas
      </Link>

      <article className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline">{offer.category}</Badge>
          <Badge variant={offer.tier === "premium" ? "default" : "secondary"}>{offer.tier === "premium" ? "Premium" : "Free"}</Badge>
          {offer.is_featured && <Badge>Featured</Badge>}
        </div>

        <h1 className="font-heading text-3xl font-bold mb-3 gradient-text">{offer.title}</h1>
        <p className="text-lg text-muted-foreground mb-6">{offer.description}</p>

        {offer.long_description && (
          <div className="mb-6 text-foreground leading-relaxed">{offer.long_description}</div>
        )}

        {offer.benefits.length > 0 && (
          <div className="mb-6">
            <h2 className="font-heading text-lg font-bold mb-3">Benefícios</h2>
            <ul className="space-y-2">
              {offer.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {offer.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">#{t}</Badge>)}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <a href={offer.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> Access {offer.title}</a>
          </Button>
          <Button variant="outline" size="lg" onClick={() => shareLink(window.location.href, offer.title)}>
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold mb-4">Ofertas relacionadas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map(r => (
              <Link key={r.id} to={`/offer/${r.id}`} className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all">
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

export default OfferDetails;
