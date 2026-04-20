import { Outlet } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import StarryBackground from "@/components/StarryBackground";

const AppLayout = () => (
  <div className="min-h-screen bg-background relative">
    <StarryBackground theme="dark" />
    <AppNavbar />
    <main className="relative z-10">
      <Outlet />
    </main>
    <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
      <p className="font-heading">⚡ PixelNova AI © 2026 — Create Anything With AI</p>
    </footer>
  </div>
);

export default AppLayout;
