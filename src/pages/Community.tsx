import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, ImagePlus, Loader2, ShieldCheck, Trash2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { COMMUNITY_RULES, canModeratePost, validateCommunityFile, validateCommunityPost } from "@/lib/community";

type Post = { id: string; user_id: string; title: string; image_url: string; created_at: string; url?: string };
type Report = { id: string; post_id: string; reason: string };
const PAGE_SIZE = 24;

export default function Community() {
  const { user } = useAuth();
  const admin = useAdmin();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [hasMore, setHasMore] = useState(false);
  const [reportPost, setReportPost] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data, error: failure } = await supabase.from("community_posts").select("*").order("created_at", { ascending: false }).limit(limit + 1);
      if (failure) throw failure;
      const rows = data || [];
      setHasMore(rows.length > limit);
      const visible = rows.slice(0, limit);
      if (visible.length) {
        const { data: urls, error: urlError } = await supabase.storage.from("community").createSignedUrls(visible.map(p => p.image_url), 3600);
        if (urlError) throw urlError;
        setPosts(visible.map(p => ({ ...p, url: urls?.find(u => u.path === p.image_url)?.signedUrl })));
      } else setPosts([]);
      if (admin) {
        const { data: list, error: reportError } = await supabase.from("community_reports").select("id, post_id, reason").order("created_at", { ascending: false });
        if (reportError) throw reportError;
        setReports(list || []);
      } else setReports([]);
    } catch { setError("Não foi possível carregar a comunidade. Tente novamente."); }
    finally { setLoading(false); }
  }, [limit, admin]);
  useEffect(() => { void load(); const timer = setInterval(() => void load(), 50 * 60 * 1000); return () => clearInterval(timer); }, [load]);

  const publish = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!user || busy) return;
    const invalid = validateCommunityPost(title, accepted) || (file ? validateCommunityFile(file) : "Escolha uma imagem.");
    if (invalid || !file) { setError(invalid || "Escolha uma imagem."); return; }
    setBusy(true); setError("");
    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    let uploaded = false;
    try {
      const { error: uploadError } = await supabase.storage.from("community").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      uploaded = true;
      const { error: postError } = await supabase.from("community_posts").insert({ user_id: user.id, title: title.trim(), image_url: path, rules_accepted: true });
      if (postError) throw postError;
      setTitle(""); setFile(null); setAccepted(false); form.reset();
      toast({ title: "Imagem publicada!" }); await load();
    } catch {
      if (uploaded) await supabase.storage.from("community").remove([path]);
      setError("Não foi possível publicar a imagem. Verifique o arquivo e tente novamente.");
    } finally { setBusy(false); }
  };
  const remove = async (post: Post) => {
    if (!canModeratePost(post.user_id, user?.id, admin) || !window.confirm("Remover esta publicação da comunidade?")) return;
    setBusy(true);
    const { data, error: failure } = await supabase.from("community_posts").delete().eq("id", post.id).select("id");
    if (failure || !data?.length) setError("Não foi possível remover a publicação.");
    else {
      const { error: storageError } = await supabase.storage.from("community").remove([post.image_url]);
      toast({ title: "Publicação removida", description: storageError ? "A limpeza do arquivo precisa ser tentada novamente." : undefined });
      await load();
    }
    setBusy(false);
  };
  const report = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !reportPost || busy) return;
    setBusy(true);
    const { error: failure } = await supabase.from("community_reports").insert({ user_id: user.id, post_id: reportPost, reason: reason.trim() });
    if (failure) setError(failure.code === "23505" ? "Você já denunciou esta publicação." : "Não foi possível enviar a denúncia.");
    else { toast({ title: "Denúncia enviada para moderação" }); setReportPost(null); setReason(""); await load(); }
    setBusy(false);
  };
  return <div className="container mx-auto max-w-6xl px-4 py-8">
    <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="font-heading text-2xl font-bold gradient-text flex items-center gap-3"><Users className="h-6 w-6 text-primary" />Comunidade</h1>
      {admin && <span className="flex items-center gap-2 text-sm text-primary"><ShieldCheck className="h-4 w-4" />Administrador</span>}
    </header>
    <details className="border-y border-border py-4 mb-6" open><summary className="cursor-pointer font-semibold text-foreground">Boas práticas da comunidade</summary><ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground mt-3">{COMMUNITY_RULES.map(rule => <li key={rule}>{rule}</li>)}</ol></details>
    {admin && <section className="mb-6 border-b border-border pb-5"><h2 className="font-heading text-lg mb-2">Moderação</h2><p className="text-sm text-muted-foreground mb-3">Gerações sem limite interno. A disponibilidade depende dos créditos e das regras dos provedores de IA.</p>{reports.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma denúncia pendente.</p> : <ul className="space-y-3">{reports.map(r => <li key={r.id} className="flex flex-wrap items-center gap-3 text-sm"><a href={`#post-${r.post_id}`} className="text-primary underline">Ver publicação</a><span className="flex-1 break-words">{r.reason}</span><Button variant="outline" size="sm" disabled={busy} onClick={async () => { const { error: failure } = await supabase.from("community_reports").delete().eq("id", r.id); if (failure) setError("Não foi possível resolver a denúncia."); else await load(); }}>Resolver</Button></li>)}</ul>}</section>}
    {user ? <form onSubmit={publish} className="mb-8 space-y-4 border-b border-border pb-6">
      <h2 className="font-heading text-lg">Compartilhar imagem</h2>
      <label className="block text-sm">Título<input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} required className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2" /></label>
      <label className="block text-sm">Imagem · JPG, PNG ou WebP · até 10 MB<input type="file" accept="image/jpeg,image/png,image/webp" className="block mt-2 w-full text-sm" onChange={e => { const selected = e.target.files?.[0]; if (selected) { const invalid = validateCommunityFile(selected); setError(invalid || ""); setFile(invalid ? null : selected); } else setFile(null); }} /></label>
      {preview && <img src={preview} alt="Prévia da imagem" className="h-40 max-w-full rounded-md object-contain" />}
      <label className="flex items-start gap-2 text-sm text-muted-foreground"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1" />Tenho autorização para compartilhar esta imagem e aceito as boas práticas.</label>
      <Button type="submit" disabled={busy || !accepted || !file || !title.trim()}>{busy ? <Loader2 className="animate-spin" /> : <ImagePlus />}Publicar imagem</Button>
    </form> : <Button asChild className="mb-6"><Link to="/auth">Entrar para compartilhar</Link></Button>}
    {error && <div role="alert" className="text-destructive mb-4 flex flex-wrap items-center gap-3">{error}<Button variant="outline" size="sm" onClick={() => void load()}>Atualizar</Button></div>}
    <h2 className="font-heading text-lg mb-4">Imagens compartilhadas</h2>
    {loading && <Loader2 aria-label="Carregando comunidade" className="animate-spin text-primary mb-4" />}
    {!loading && !posts.length && !error && <p className="text-muted-foreground py-10 text-center">Nenhuma imagem compartilhada ainda.</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{posts.map(post => <article key={post.id} id={`post-${post.id}`} className="rounded-lg border border-border bg-card overflow-hidden scroll-mt-32">
      {post.url ? <a href={post.url} target="_blank" rel="noreferrer"><img src={post.url} alt={post.title} loading="lazy" className="w-full aspect-square object-contain bg-muted" /></a> : <div className="aspect-square grid place-items-center text-muted-foreground">Imagem indisponível</div>}
      <div className="p-4"><h3 className="text-sm font-semibold break-words">{post.title}</h3><div className="flex items-center justify-between gap-2 mt-3"><time className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString("pt-BR")}</time><div className="flex gap-1">{user && <Button size="icon" variant="ghost" title="Denunciar publicação" aria-label={`Denunciar ${post.title}`} onClick={() => { setReportPost(post.id); setReason(""); }}><Flag /></Button>}{canModeratePost(post.user_id, user?.id, admin) && <Button size="icon" variant="ghost" disabled={busy} title="Remover publicação" aria-label={`Remover ${post.title}`} onClick={() => void remove(post)}><Trash2 /></Button>}</div></div>
      {reportPost === post.id && <form onSubmit={report} className="mt-3 space-y-2"><label className="text-sm">Motivo da denúncia<textarea required minLength={3} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} className="block w-full bg-background border border-input rounded-md p-2 mt-1" /></label><div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy || reason.trim().length < 3}>Enviar denúncia</Button><Button type="button" variant="ghost" size="sm" onClick={() => setReportPost(null)}>Cancelar</Button></div></form>}</div>
    </article>)}</div>
    {hasMore && <Button variant="outline" disabled={loading} className="mt-6" onClick={() => setLimit(v => v + PAGE_SIZE)}>Carregar mais</Button>}
  </div>;
}