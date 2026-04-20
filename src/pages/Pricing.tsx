import { Check, Zap, Crown, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Free",
    price: "R$0",
    period: "/mês",
    icon: Zap,
    description: "Para experimentar",
    features: ["5 créditos/dia", "Geração de imagens", "Chat IA", "Galeria pública", "Download HD"],
    cta: "Plano Atual",
    disabled: true,
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$29",
    period: "/mês",
    icon: Crown,
    description: "Para criadores",
    features: ["50 créditos/dia", "Todos os modelos", "Sem marca d'água", "Prioridade na fila", "Histórico ilimitado", "Suporte prioritário"],
    cta: "Em Breve",
    disabled: true,
    highlight: true,
  },
  {
    name: "Unlimited",
    price: "R$79",
    period: "/mês",
    icon: Infinity,
    description: "Sem limites",
    features: ["Créditos ilimitados", "API access", "Modelos exclusivos", "Resolução 4K", "Uso comercial", "Suporte VIP 24/7"],
    cta: "Em Breve",
    disabled: true,
    highlight: false,
  },
];

const Pricing = () => (
  <div className="container mx-auto px-4 py-12 max-w-5xl">
    <div className="text-center mb-12">
      <h1 className="font-heading text-3xl font-bold gradient-text mb-3">Planos & Preços</h1>
      <p className="text-muted-foreground max-w-md mx-auto">Escolha o plano ideal para suas criações com IA.</p>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {plans.map(plan => (
        <div key={plan.name} className={`rounded-2xl border p-6 flex flex-col ${plan.highlight ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" : "border-border bg-card"}`}>
          <plan.icon className={`h-8 w-8 mb-3 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
          <h3 className="font-heading text-lg font-bold text-foreground">{plan.name}</h3>
          <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
          <div className="mb-4">
            <span className="text-3xl font-bold text-foreground">{plan.price}</span>
            <span className="text-sm text-muted-foreground">{plan.period}</span>
          </div>
          <ul className="space-y-2 mb-6 flex-1">
            {plan.features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <Button disabled={plan.disabled} className={plan.highlight ? "" : ""}>{plan.cta}</Button>
        </div>
      ))}
    </div>
  </div>
);

export default Pricing;
