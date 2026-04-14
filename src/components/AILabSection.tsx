import { Bot, Image, MessageSquare, Wand2, Zap, Globe } from "lucide-react";

const tools = [
  {
    icon: MessageSquare,
    title: "Chat Inteligente",
    description: "Converse com IA avançada sobre qualquer assunto. Respostas rápidas e precisas.",
    color: "text-accent",
  },
  {
    icon: Image,
    title: "Geração de Imagens",
    description: "Crie imagens incríveis a partir de descrições de texto com modelos de última geração.",
    color: "text-primary",
  },
  {
    icon: Wand2,
    title: "Assistente Criativo",
    description: "Escreva textos, poemas, código e muito mais com ajuda de IA criativa.",
    color: "text-secondary",
  },
  {
    icon: Globe,
    title: "Busca Inteligente",
    description: "Pesquise informações em tempo real com IA que entende contexto.",
    color: "text-glow-blue",
  },
  {
    icon: Zap,
    title: "APIs Ilimitadas",
    description: "Acesse as melhores APIs de IA disponíveis, integradas e prontas para uso.",
    color: "text-glow-gold",
  },
  {
    icon: Bot,
    title: "Lumy — Seu Assistente",
    description: "Nosso mascote de luz está sempre pronto para ajudar com qualquer coisa!",
    color: "text-glow-purple",
  },
];

const AILabSection = () => {
  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-3">
          <Bot className="h-6 w-6 text-secondary" />
          <h2 className="font-heading text-2xl font-bold gradient-text">Laboratório de IA</h2>
        </div>
        <p className="text-muted-foreground mb-8 max-w-xl">
          Explore ferramentas poderosas de inteligência artificial, todas integradas e prontas para uso.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
            >
              <tool.icon className={`h-8 w-8 mb-4 ${tool.color} transition-transform group-hover:scale-110`} />
              <h3 className="font-heading text-sm font-semibold mb-2 text-card-foreground">{tool.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AILabSection;
