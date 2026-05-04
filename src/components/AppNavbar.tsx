import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Wrench, Compass, CreditCard, LayoutDashboard, LogIn, LogOut, Star, Gift, Bookmark, Plus, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import mascotImg from "@/assets/mascot.png";
import PixSupportModal from "@/components/PixSupportModal";

const navItems = [
  { path: "/", label: "Home", icon: Sparkles },
  { path: "/tools", label: "Tools", icon: Wrench },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/offerings", label: "Earn", icon: Gift },
  { path: "/pricing", label: "Pricing", icon: CreditCard },
];

const AppNavbar = () => {
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const location = useLocation();
  const [pixOpen, setPixOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <PixSupportModal open={pixOpen} onOpenChange={setPixOpen} />
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={mascotImg} alt="PixelNova AI" className="h-8 w-8" width={32} height={32} />
          <h1 className="font-heading text-lg font-bold gradient-text">PixelNova AI</h1>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                location.pathname === path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}>
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
          {user && (
            <>
              <Link to="/favorites"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  location.pathname === "/favorites" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <Bookmark className="h-4 w-4" /> Favorites
              </Link>
              <Link to="/dashboard"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  location.pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPixOpen(true)}
            className="hidden sm:flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
            title="Apoie via Pix e ganhe créditos bônus"
          >
            <Heart className="h-3.5 w-3.5" /> Buy Credits
          </button>
          <Link to="/submit" className="hidden sm:flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
            <Plus className="h-3.5 w-3.5" /> Submit
          </Link>
          <div className="flex items-center gap-1 bg-muted rounded-lg px-2.5 py-1.5 text-xs font-medium">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">{credits}</span>
          </div>
          {user ? (
            <button onClick={signOut} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <Link to="/auth" className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <LogIn className="h-4 w-4" /> Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden items-center justify-around border-t border-border px-2 py-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link key={path} to={path}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-all ${
              location.pathname === path ? "text-primary" : "text-muted-foreground"
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
        {user && (
          <Link to="/dashboard" className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-xs transition-all ${location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"}`}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        )}
      </div>
    </nav>
  );
};

export default AppNavbar;
