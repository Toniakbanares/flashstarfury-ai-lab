import { Moon, Sun, Leaf } from "lucide-react";

type Theme = "dark" | "light" | "nature";

interface ThemeSwitcherProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const ThemeSwitcher = ({ theme, onThemeChange }: ThemeSwitcherProps) => {
  const themes: { key: Theme; icon: typeof Moon; label: string }[] = [
    { key: "dark", icon: Moon, label: "Dark" },
    { key: "light", icon: Sun, label: "Light" },
    { key: "nature", icon: Leaf, label: "Nature" },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
      {themes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onThemeChange(key)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            theme === key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label={`Tema ${label}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
