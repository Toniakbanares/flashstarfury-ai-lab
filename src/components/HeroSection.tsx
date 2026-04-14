import mascotImg from "@/assets/mascot.png";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

      <div className="relative z-10 text-center px-4 py-16">
        <div className="animate-float mb-6 inline-block">
          <img
            src={mascotImg}
            alt="Lumy - mascote Flash Star Fury"
            className="mx-auto h-32 w-32 drop-shadow-[0_0_30px_rgba(255,215,0,0.5)]"
            width={512}
            height={512}
          />
        </div>

        <h1 className="font-heading text-4xl md:text-6xl font-black mb-4 text-glow-gold gradient-text">
          Flash Star Fury
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Seu laboratório de Inteligência Artificial com as últimas notícias, chat com IA e geração de imagens — tudo em um só lugar ✨
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="font-heading text-sm font-semibold rounded-full px-6 py-3 gradient-gold-purple text-primary-foreground box-glow-gold transition-transform hover:scale-105">
            🚀 Explorar Lab IA
          </button>
          <button className="font-heading text-sm font-semibold rounded-full px-6 py-3 border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all">
            📰 Ver Notícias
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
