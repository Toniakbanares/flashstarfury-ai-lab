import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/hooks/useCredits";
import { Heart, Image, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const { credits } = useCredits();
  const [generations, setGenerations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, public: 0, likes: 0 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) {
          setGenerations(data);
          setStats({
            total: data.length,
            public: data.filter(g => g.is_public).length,
            likes: data.reduce((sum, g) => sum + (g.likes_count || 0), 0),
          });
        }
      });
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="font-heading text-2xl font-bold gradient-text mb-6">Meu Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { icon: Star, label: "Créditos Hoje", value: `${credits}/5` },
          { icon: Image, label: "Gerações", value: stats.total },
          { icon: Clock, label: "Públicas", value: stats.public },
          { icon: Heart, label: "Likes Recebidos", value: stats.likes },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <Icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-heading text-lg font-semibold mb-4 text-foreground">Minhas Criações</h2>
      {generations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhuma criação ainda.</p>
          <Link to="/tools" className="text-primary hover:underline text-sm">Comece a criar →</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generations.map(gen => (
            <div key={gen.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {gen.image_url && <img src={gen.image_url} alt={gen.prompt} className="w-full h-40 object-cover" loading="lazy" />}
              <div className="p-3">
                <p className="text-xs text-muted-foreground truncate">{gen.prompt}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3" /> {gen.likes_count}
                  <span className="ml-auto">{gen.is_public ? "Público" : "Privado"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
