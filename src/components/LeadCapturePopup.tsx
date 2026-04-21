import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "pixelnova_lead_dismissed";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(80),
  email: z.string().trim().email("Email inválido").max(200),
});

const LeadCapturePopup = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const onScroll = () => {
      if (window.scrollY > 400) {
        setOpen(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    const timer = setTimeout(() => setOpen(true), 25000);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(timer); };
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ name, email });
    if (!parsed.success) { toast({ title: parsed.error.issues[0].message, variant: "destructive" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("leads").insert({ ...parsed.data, source: "offerings_popup" });
    setSubmitting(false);
    if (error) { toast({ title: "Erro ao enviar", variant: "destructive" }); return; }
    toast({ title: "🎉 Bem-vindo!", description: "Você receberá novas ofertas em breve." });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-heading text-xl">Unlock more AI income tools</DialogTitle>
          <DialogDescription className="text-center">
            Receba ofertas exclusivas, ferramentas premium e dicas de monetização IA.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Enviando..." : "Quero acesso 🚀"}
          </Button>
          <button type="button" onClick={handleClose} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
            Não, obrigado
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCapturePopup;
