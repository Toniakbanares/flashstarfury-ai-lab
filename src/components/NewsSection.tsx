import { Newspaper, ExternalLink, Clock, Sparkles } from "lucide-react";

const mockNews = [
  {
    id: 1,
    title: "GPT-5 é lançado com capacidades multimodais revolucionárias",
    summary: "A OpenAI apresentou hoje o GPT-5, seu modelo mais avançado, com capacidade de processar vídeo em tempo real e raciocinar sobre problemas complexos.",
    category: "IA",
    time: "2h atrás",
    hot: true,
  },
  {
    id: 2,
    title: "Google DeepMind anuncia avanço em fusão nuclear com IA",
    summary: "Pesquisadores usaram modelos de IA para otimizar o confinamento de plasma, um passo significativo para energia limpa ilimitada.",
    category: "Ciência",
    time: "4h atrás",
    hot: true,
  },
  {
    id: 3,
    title: "Novos modelos de geração de imagens superam benchmarks",
    summary: "A nova geração de modelos de difusão consegue criar imagens fotorrealistas em segundos com qualidade inédita.",
    category: "IA",
    time: "6h atrás",
    hot: false,
  },
  {
    id: 4,
    title: "Flash Star Fury atinge 10 mil usuários em uma semana",
    summary: "Nossa plataforma continua crescendo! A comunidade celebra o marco com novos recursos e integrações de IA.",
    category: "Flash Star Fury",
    time: "8h atrás",
    hot: false,
  },
  {
    id: 5,
    title: "Regulamentação de IA avança na União Europeia",
    summary: "Novos frameworks de governança para inteligência artificial são aprovados, impactando empresas de tecnologia globalmente.",
    category: "Política",
    time: "12h atrás",
    hot: false,
  },
  {
    id: 6,
    title: "Robôs humanoides já trabalham em fábricas na China",
    summary: "Empresas chinesas implementam robôs com IA avançada em linhas de produção, aumentando eficiência em 300%.",
    category: "Robótica",
    time: "1d atrás",
    hot: false,
  },
];

const NewsSection = () => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-8">
          <Newspaper className="h-6 w-6 text-primary" />
          <h2 className="font-heading text-2xl font-bold gradient-text">Últimas Notícias</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockNews.map((news) => (
            <article
              key={news.id}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold rounded-full px-2.5 py-0.5 bg-primary/10 text-primary">
                  {news.category}
                </span>
                {news.hot && (
                  <span className="flex items-center gap-1 text-xs text-glow-gold font-semibold">
                    <Sparkles className="h-3 w-3" /> HOT
                  </span>
                )}
              </div>

              <h3 className="font-heading text-sm font-semibold mb-2 text-card-foreground group-hover:text-primary transition-colors leading-tight">
                {news.title}
              </h3>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {news.summary}
              </p>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {news.time}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
