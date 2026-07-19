import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Wand2, Copy, Download, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLikes } from "@/hooks/useLikes";
import { copyToClipboard, shareLinks } from "@/lib/share";
import CreationCard from "@/components/CreationCard";

const CreationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gen, setGen] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = gen ? [gen.id, ...related.map(r => r.id)] : [];
  const { liked, toggle } = useLikes(ids);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("generations")
        .select("*, profiles(display_name, avatar_url)")
        .eq("id", id).eq("is_public", true).maybeSingle();
      if (!data) { setLoading(false); return; }
      setGen(data);
      // SEO
      document.title = `${data.prompt.slice(0, 60)} | StarFury AI`;
      const { data: rel } = await supabase
        .from("generations")
        .select("*, profiles(display_name, avatar_url)")
        .eq("is_public", true).eq("tool_type", data.tool_type).neq("id", data.id)
        .order("likes_count", { ascending: false }).limit(8);
      if (rel) setRelated(rel);
      setLoading(false);
    })();
  }, [id]);

  const handleLike = async (genId: string) => {
    const wasLiked = liked.has(genId);
    const result = await toggle(genId);
    if (!result) return;
    const delta = result === "liked" ? 1 : -1;
    if (gen?.id === genId) setGen({ ...gen, likes_count: Math.max(0, gen.likes_count + delta) });
    setRelated(prev => prev.map(g => g.id === genId ? { ...g, likes_count: Math.max(0, g.likes_count + delta) } : g));
  };

  if (loading) return <div className="container mx-auto px-4 py-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!gen) return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Criação não encontrada.</div>;

  const publicUrl = `${window.location.origin}/create/${gen.id}`;
  const links = shareLinks(publicUrl, `Confira esta criação no StarFury AI: ${gen.prompt.slice(0, 80)}`);
  const creator = gen.profiles?.display_name || "Anônimo";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {gen.image_url && (
          <img src={gen.image_url} alt={gen.prompt} className="w-full rounded-xl border border-border" />
        )}
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">por {creator}</p>
          <h1 className="font-heading text-xl font-bold text-foreground leading-snug">{gen.prompt}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className={`h-4 w-4 ${liked.has(gen.id) ? "fill-primary text-primary" : ""}`} /> {gen.likes_count} curtidas
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleLike(gen.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all ${liked.has(gen.id) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/40"}`}>
              <Heart className={`h-4 w-4 ${liked.has(gen.id) ? "fill-current" : ""}`} /> {liked.has(gen.id) ? "Curtido" : "Curtir"}
            </button>
            <Link to={`/tools?tool=image&prompt=${encodeURIComponent(gen.prompt)}&remix=${gen.id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:opacity-90">
              <Wand2 className="h-4 w-4" /> Remix (1 crédito)
            </Link>
            <button onClick={async () => { if (await copyToClipboard(gen.prompt)) toast({ title: "Prompt copiado!" }); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border hover:border-primary/40">
              <Copy className="h-4 w-4" /> Copiar prompt
            </button>
            {gen.image_url && (
              <a href={gen.image_url} download target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border hover:border-primary/40">
                <Download className="h-4 w-4" /> Download
              </a>
            )}
            <button onClick={async () => { if (await copyToClipboard(publicUrl)) toast({ title: "Link copiado!" }); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-border hover:border-primary/40">
              <Share2 className="h-4 w-4" /> Copiar link
            </button>
          </div>
          <div className="flex gap-2 pt-2">
            <a href={links.twitter} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40">Twitter</a>
            <a href={links.reddit} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40">Reddit</a>
            <a href={links.whatsapp} target="_blank" rel="noreferrer" className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/40">WhatsApp</a>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Criações relacionadas</h2>
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {related.map(r => (
              <CreationCard key={r.id} gen={r} isLiked={liked.has(r.id)} onLike={handleLike} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CreationDetails;
