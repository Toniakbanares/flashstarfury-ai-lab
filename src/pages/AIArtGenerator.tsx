import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Brush } from "lucide-react";

const AIArtGenerator = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="font-heading text-3xl font-bold gradient-text mb-3">AI Art Generator</h1>
    <p className="text-muted-foreground mb-8 max-w-2xl">
      Transforme suas ideias em arte digital com inteligência artificial. 
      Explore estilos artísticos de todo o mundo.
    </p>

    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      {["Impressionismo", "Surrealismo", "Pop Art", "Abstrato"].map(style => (
        <div key={style} className="rounded-xl border border-border bg-card p-4">
          <Brush className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-heading text-sm font-semibold text-foreground">{style}</h3>
          <p className="text-xs text-muted-foreground">Crie arte neste estilo</p>
        </div>
      ))}
    </div>

    <Link to="/tools"><Button size="lg" className="gap-2"><Sparkles className="h-4 w-4" /> Criar Arte</Button></Link>

    <div className="mt-12 prose prose-sm dark:prose-invert max-w-none">
      <h2>Arte digital com IA</h2>
      <p>Nosso gerador de arte usa modelos avançados para criar obras em qualquer estilo artístico. De impressionismo a arte abstrata.</p>
    </div>
  </div>
);

export default AIArtGenerator;
