import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Share2,
  Sparkles,
  ShieldCheck,
  Wallet,
  Settings2,
  Users,
  Lightbulb,
  Image as ImageIcon,
  Briefcase,
  Heart,
} from "lucide-react";
import { shareLink } from "@/lib/share";

type Offer = {
  id: string;
  title: string;
  description: string;
  long_description: string | null;
  category: string;
  url: string;
  image_url: string | null;
  tier: string;
  is_featured: boolean;
  benefits: string[];
  tags: string[];
};

// Map a category to the most relevant in-app generator
const internalToolFor = (category: string): { path: string; label: string } => {
  const c = (category || "").toLowerCase();
  if (c.includes("logo")) return { path: "/ai-logo-generator", label: "AI Logo Generator" };
  if (c.includes("avatar")) return { path: "/ai-avatar-generator", label: "AI Avatar Generator" };
  if (c.includes("art")) return { path: "/ai-art-generator", label: "AI Art Generator" };
  if (c.includes("image") || c.includes("photo")) return { path: "/ai-image-generator", label: "AI Image Generator" };
  return { path: "/tools", label: "StarFury AI Studio" };
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
        document.title = `${data.title} — StarFury AI`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", data.description);
        supabase
          .from("offers")
          .select("*")
          .eq("category", data.category)
          .neq("id", id)
          .limit(3)
          .then(({ data: rel }) => setRelated((rel as Offer[]) ?? []));
      }
    });
  }, [id]);

  const internalTool = useMemo(() => internalToolFor(offer?.category ?? ""), [offer]);
  const tryInsideUrl = useMemo(() => {
    if (!offer) return "/tools";
    const prompt = encodeURIComponent(offer.title);
    return `${internalTool.path}?prompt=${prompt}`;
  }, [offer, internalTool]);

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        to="/offerings"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to offerings
      </Link>

      <article className="rounded-2xl border border-border bg-card p-6 md:p-10 space-y-10">
        {/* 1. CLEAR VALUE HEADER */}
        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{offer.category}</Badge>
            <Badge variant={offer.tier === "premium" ? "default" : "secondary"}>
              {offer.tier === "premium" ? "Paid plan" : "Free tier available"}
            </Badge>
            {offer.is_featured && <Badge variant="secondary">Editor's pick</Badge>}
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold gradient-text leading-tight">
            {offer.title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            {offer.description}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="lg">
              <Link to={tryInsideUrl}>
                <Sparkles className="h-4 w-4" /> Try inside StarFury AI
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={offer.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Visit official site
              </a>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => shareLink(window.location.href, offer.title)}
            >
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </header>

        <Separator />

        {/* 11. PREVIEW */}
        {offer.image_url && (
          <section>
            <h2 className="font-heading text-lg font-bold mb-3">Example output</h2>
            <div className="rounded-xl overflow-hidden border border-border aspect-video bg-muted">
              <img
                src={offer.image_url}
                alt={`Example produced with ${offer.title}`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Illustrative result. Actual output depends on your prompt and settings.
            </p>
          </section>
        )}

        {/* What it is — long description if available */}
        {offer.long_description && (
          <section className="space-y-2">
            <h2 className="font-heading text-lg font-bold">About this tool</h2>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {offer.long_description}
            </p>
          </section>
        )}

        {/* 2. WHO IS THIS FOR */}
        <section>
          <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Who this is for
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Beginners exploring AI for the first time",
              "Creators producing content regularly",
              "Entrepreneurs building a brand on a budget",
              "Designers prototyping ideas faster",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 rounded-lg border border-border bg-background/40 p-3 text-sm"
              >
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. WHAT YOU CAN DO */}
        <section>
          <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> What you can do
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {(offer.benefits && offer.benefits.length > 0
              ? offer.benefits
              : [
                  "Generate images from text prompts",
                  "Create logos and brand visuals",
                  "Build content for posts and pages",
                  "Save time on repetitive design tasks",
                ]
            ).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. REAL USE CASES */}
        <section>
          <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> Real use cases
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: ImageIcon, title: "Social media content", text: "Posts, thumbnails and visuals for Instagram, TikTok, YouTube." },
              { icon: Briefcase, title: "Business branding", text: "Logos, mockups and product imagery for small businesses." },
              { icon: Wallet, title: "Online income tools", text: "Assets for digital products, freelance work or shops." },
              { icon: Heart, title: "Personal projects", text: "Illustrations, gifts, hobby art and learning AI by doing." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-border bg-background/40 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm">{title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CONNECT WITH TOOLS */}
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold mb-1">Try it inside StarFury AI</h2>
            <p className="text-sm text-muted-foreground">
              Open the {internalTool.label} with this idea pre-filled and start creating in seconds.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to={tryInsideUrl}>
              <Sparkles className="h-4 w-4" /> Start creating <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>

        {/* 7. TRUST SECTION */}
        <section>
          <h2 className="font-heading text-lg font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> What we promise
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Wallet, title: "No hidden costs", text: "A free tier is available so you can try before paying anything." },
              { icon: Sparkles, title: "Transparent credits", text: "You always see how many credits you have and what each action uses." },
              { icon: Settings2, title: "You stay in control", text: "Your prompts and creations belong to you. Cancel or stop anytime." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-border bg-background/40 p-4">
                <Icon className="h-4 w-4 text-primary mb-2" />
                <h3 className="font-medium text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {offer.tags && offer.tags.length > 0 && (
          <section>
            <div className="flex flex-wrap gap-1.5">
              {offer.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">
                  #{t}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Final honest CTA */}
        <section className="rounded-xl border border-border bg-background/40 p-6 text-center space-y-3">
          <h2 className="font-heading text-xl font-bold">Ready to explore?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Start with a small idea, see what the tool can do, and decide if it fits your workflow.
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            <Button asChild>
              <Link to={tryInsideUrl}>
                <Sparkles className="h-4 w-4" /> Start creating
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href={offer.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" /> Try the tool
              </a>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/tools">Explore features</Link>
            </Button>
          </div>
        </section>
      </article>

      {/* 10. RELATED TOOLS */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-heading text-xl font-bold mb-4">Similar tools on StarFury AI</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/offer/${r.id}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all"
              >
                <Badge variant="outline" className="text-[10px] mb-2">
                  {r.category}
                </Badge>
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
