import { Link } from "react-router-dom";
import { Sparkles, Image, MessageSquare, Code, Palette, Wand2, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascotImg from "@/assets/mascot.png";

const tools = [
  { icon: Image, title: "Gerador de Imagens", desc: "Crie imagens incríveis com IA", link: "/tools" },
  { icon: MessageSquare, title: "Chat IA", desc: "Converse com IA avançada", link: "/tools" },
  { icon: Code, title: "Gerador de Código", desc: "Código em qualquer linguagem", link: "/tools" },
  { icon: Palette, title: "Arte Digital", desc: "Estilos artísticos únicos", link: "/tools" },
  { icon: Wand2, title: "Assistente Criativo", desc: "Textos e roteiros criativos", link: "/tools" },
  { icon: Sparkles, title: "Logos & Avatares", desc: "Identidade visual com IA", link: "/ai-logo-generator" },
];

const Landing = () => (
  <div className="space-y-16 pb-12">
    {/* Hero */}
    <section className="container mx-auto px-4 pt-16 text-center">
      <img src={mascotImg} alt="PixelNova" className="h-20 w-20 mx-auto mb-4 animate-float" />
      <h1 className="font-heading text-4xl md:text-5xl font-bold gradient-text mb-4">
        Create Anything With AI
      </h1>
      <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
        Gere imagens, textos, código e muito mais. 100% grátis, sem limites escondidos.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/tools"><Button size="lg" className="gap-2"><Zap className="h-4 w-4" /> Começar Grátis</Button></Link>
        <Link to="/explore"><Button size="lg" variant="outline" className="gap-2"><TrendingUp className="h-4 w-4" /> Explorar</Button></Link>
      </div>
    </section>

    {/* Tools Grid */}
    <section className="container mx-auto px-4">
      <h2 className="font-heading text-2xl font-bold text-center text-foreground mb-8">Ferramentas IA</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(t => (
          <Link key={t.title} to={t.link} className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
            <t.icon className="h-8 w-8 text-primary mb-3 transition-transform group-hover:scale-110" />
            <h3 className="font-heading text-sm font-semibold text-card-foreground mb-1">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.desc}</p>
          </Link>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container mx-auto px-4 text-center">
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
        <h2 className="font-heading text-xl font-bold text-foreground mb-2">Pronto para criar?</h2>
        <p className="text-muted-foreground text-sm mb-4">5 créditos grátis por dia. Sem cartão de crédito.</p>
        <Link to="/auth"><Button>Criar Conta Grátis</Button></Link>
      </div>
    </section>
  </div>
);

export default Landing;
