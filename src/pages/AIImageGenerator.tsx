import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image, Sparkles } from "lucide-react";

const AIImageGenerator = () => (
  <div className="container mx-auto px-4 py-12 max-w-4xl">
    <h1 className="font-heading text-3xl font-bold gradient-text mb-3">AI Image Generator</h1>
    <p className="text-muted-foreground mb-8 max-w-2xl">
      Gere imagens impressionantes com inteligência artificial. Escolha entre diversos modelos de arte, 
      aspect ratios e estilos. Totalmente gratuito, sem necessidade de cadastro para explorar.
    </p>

    <div className="grid gap-4 sm:grid-cols-2 mb-8">
      {["Fotorealismo", "Anime & Mangá", "Arte 3D", "Dark & Sombrio"].map(style => (
        <div key={style} className="rounded-xl border border-border bg-card p-4">
          <Image className="h-6 w-6 text-primary mb-2" />
          <h3 className="font-heading text-sm font-semibold text-foreground">{style}</h3>
          <p className="text-xs text-muted-foreground">Crie imagens neste estilo com IA</p>
        </div>
      ))}
    </div>

    <Link to="/tools">
      <Button size="lg" className="gap-2"><Sparkles className="h-4 w-4" /> Gerar Imagem Agora</Button>
    </Link>

    <div className="mt-12 prose prose-sm dark:prose-invert max-w-none">
      <h2>Como funciona o gerador de imagens IA?</h2>
      <p>Nosso gerador utiliza modelos de difusão como Flux para criar imagens de alta qualidade a partir de descrições em texto. Basta descrever o que deseja e a IA cria a imagem em segundos.</p>
      <h2>É realmente grátis?</h2>
      <p>Sim! Você recebe 5 créditos por dia para gerar imagens. Cada geração consome 1 crédito.</p>
    </div>
  </div>
);

export default AIImageGenerator;
