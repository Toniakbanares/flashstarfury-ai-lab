import { Sparkles, Newspaper, Bot, MessageSquare } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import mascotImg from "@/assets/mascot.png";

type Theme = "dark" | "light" | "nature";

interface NavbarProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navbar = ({ theme, onThemeChange, activeSection, onSectionChange }: NavbarProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Sparkles },
    { id: "news", label: "Notícias", icon: Newspaper },
    { id: "ai-lab", label: "Lab IA", icon: Bot },
    { id: "chat", label: "Chat IA", icon: MessageSquare },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={mascotImg} alt="Flash Star Fury mascot" className="h-8 w-8" width={32} height={32} />
          <h1 className="font-heading text-lg font-bold gradient-text">Flash Star Fury</h1>
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeSection === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden items-center justify-around border-t border-border px-2 py-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-all ${
              activeSection === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
