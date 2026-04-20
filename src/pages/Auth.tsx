import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Chrome } from "lucide-react";
import mascotImg from "@/assets/mascot.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else navigate("/");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else toast({ title: "Sucesso!", description: "Verifique seu email para confirmar a conta." });
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast({ title: "Erro", description: "Falha ao entrar com Google", variant: "destructive" });
    if (!result.redirected && !result.error) navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <img src={mascotImg} alt="PixelNova" className="h-16 w-16 mx-auto" />
          <h1 className="font-heading text-2xl font-bold gradient-text">PixelNova AI</h1>
          <p className="text-muted-foreground text-sm">{isLogin ? "Entre na sua conta" : "Crie sua conta grátis"}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Button onClick={handleGoogle} variant="outline" className="w-full gap-2">
            <Chrome className="h-4 w-4" /> Entrar com Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="pl-9" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "Criar grátis" : "Fazer login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
