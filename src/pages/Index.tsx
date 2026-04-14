import { useState, useEffect } from "react";
import StarryBackground from "@/components/StarryBackground";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NewsSection from "@/components/NewsSection";
import AILabSection from "@/components/AILabSection";
import ChatSection from "@/components/ChatSection";
import GoogleAds from "@/components/GoogleAds";

type Theme = "dark" | "light" | "nature";

const Index = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-nature");
    if (theme === "light") root.classList.add("theme-light");
    if (theme === "nature") root.classList.add("theme-nature");
  }, [theme]);

  const renderSection = () => {
    switch (activeSection) {
      case "news":
        return <NewsSection />;
      case "ai-lab":
        return <AILabSection />;
      case "chat":
        return <ChatSection />;
      default:
        return (
          <>
            <HeroSection />
            <GoogleAds />
            <NewsSection />
            <AILabSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <StarryBackground theme={theme} />
      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="relative z-10">{renderSection()}</main>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p className="font-heading">⚡ Flash Star Fury © 2026 — Powered by IA</p>
      </footer>
    </div>
  );
};

export default Index;
