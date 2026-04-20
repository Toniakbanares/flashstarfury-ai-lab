import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles } from "lucide-react";

const AILogoGenerator = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="font-heading text-3xl font-bold gradient-text mb-3">AI Logo Generator</h1>
    <p className="text-muted-foreground mb-8 max-w-2xl">
      Crie logos profissionais para sua marca com inteligência artificial. 
      Gere múltiplas variações e encontre o design perfeito em segundos.
    </p>

    <div className="grid gap-4 sm:grid-cols-3 mb-8">
      {["Minimalista", "Moderno", "Vintage"].map(style => (
        <div key={style} className="rounded-xl border border-border bg-card p-4 text-center">
          <Palette className="h-6 w-6 text-primary mb-2 mx-auto" />
          <h3 className="font-heading text-sm font-semibold text-foreground">{style}</h3>
        </div>
      ))}
    </div>

    <Link to="/tools"><Button size="lg" className="gap-2"><Sparkles className="h-4 w-4" /> Criar Logo</Button></Link>

    <div className="mt-12 prose prose-sm dark:prose-invert max-w-none">
      <h2>Crie logos com IA gratuitamente</h2>
      <p>Descreva sua marca e estilo desejado. A IA gera múltiplas opções de logo para você escolher e baixar em alta resolução.</p>
    </div>
  </div>
);

export default AILogoGenerator;
