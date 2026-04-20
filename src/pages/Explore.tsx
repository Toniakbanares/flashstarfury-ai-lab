import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Copy, Shuffle, Download, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Explore = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generations, setGenerations] = useState<any[]>([]);
  const [tab, setTab] = useState<"trending" | "latest">("trending");

  useEffect(() => {
    const order = tab === "trending" ? "likes_count" : "created_at";
    supabase
      .from("generations")
      .select("*, profiles(display_name, avatar_url)")
      .eq("is_public", true)
      .order(order, { ascending: false })
      .limit(50)
      .then(({ data }) => { if (data) setGenerations(data); });
  }, [tab]);

  const handleLike = async (genId: string) => {
    if (!user) { toast({ title: "Faça login para curtir" }); return; }
    const { error } = await supabase.from("generation_likes").insert({ user_id: user.id, generation_id: genId });
    if (!error) {
      setGenerations(prev => prev.map(g => g.id === genId ? { ...g, likes_count: g.likes_count + 1 } : g));
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({ title: "Prompt copiado!" });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold gradient-text">Explorar</h1>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button onClick={() => setTab("trending")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === "trending" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <TrendingUp className="h-3 w-3" /> Trending
          </button>
          <button onClick={() => setTab("latest")} className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === "latest" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Clock className="h-3 w-3" /> Recentes
          </button>
        </div>
      </div>

      {generations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Nenhuma criação pública ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {generations.map(gen => (
            <div key={gen.id} className="break-inside-avoid rounded-xl border border-border bg-card overflow-hidden group">
              {gen.image_url && <img src={gen.image_url} alt={gen.prompt} className="w-full" loading="lazy" />}
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{gen.prompt}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleLike(gen.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-3.5 w-3.5" /> {gen.likes_count}
                  </button>
                  <button onClick={() => copyPrompt(gen.prompt)} className="p-1 text-muted-foreground hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                  {gen.image_url && (
                    <a href={gen.image_url} download className="p-1 text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
