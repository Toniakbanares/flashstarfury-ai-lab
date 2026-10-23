import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Flag, Image as ImageIcon, Mail, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";

type Stats = {
  users: number; users_7d: number; generations: number; generations_7d: number;
  generations_by_type: Record<string, number>; posts: number; posts_7d: number; reports: number; leads: number;
};

const Card = ({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: number; sub?: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs"><Icon className="h-4 w-4 text-primary" />{label}</div>
    <p className="font-heading text-3xl font-bold text-foreground mt-2">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const Admin = () => {
  const { user } = useAuth();
  const isAdmin = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.rpc("admin_usage_stats").then(({ data, error }) => {
      if (error) setError("Não foi possível carregar os números agora.");
      else setStats(data as unknown as Stats);
    });
  }, [isAdmin]);

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto max-w-xl py-16 px-4 text-center">
        <h1 className="font-heading text-2xl font-bold text-foreground">Área restrita</h1>
        <p className="text-muted-foreground mt-2">Somente administradores podem ver este painel.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h1 className="font-heading text-2xl font-bold text-foreground">Painel do Administrador</h1>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!stats && !error && <p className="text-muted-foreground text-sm">Carregando…</p>}
      {stats && (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <Card icon={Users} label="Usuários" value={stats.users} sub={`+${stats.users_7d} nos últimos 7 dias`} />
            <Card icon={Sparkles} label="Gerações salvas" value={stats.generations} sub={`+${stats.generations_7d} nos últimos 7 dias`} />
            <Card icon={ImageIcon} label="Posts na comunidade" value={stats.posts} sub={`+${stats.posts_7d} nos últimos 7 dias`} />
            <Card icon={Flag} label="Denúncias pendentes" value={stats.reports} />
            <Card icon={Mail} label="Contatos capturados" value={stats.leads} />
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-bold text-foreground mb-3">Gerações por ferramenta</h2>
            {Object.keys(stats.generations_by_type).length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma geração salva ainda.</p>
            ) : (
              <ul className="space-y-1 text-sm">
                {Object.entries(stats.generations_by_type).sort((a, b) => b[1] - a[1]).map(([t, c]) => (
                  <li key={t} className="flex justify-between"><span className="text-foreground capitalize">{t}</span><span className="text-muted-foreground">{c}</span></li>
                ))}
              </ul>
            )}
          </div>
          {stats.reports > 0 && (
            <Link to="/community" className="inline-block text-sm text-primary hover:underline">Revisar denúncias na Comunidade →</Link>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
