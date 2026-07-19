import { Outlet } from "react-router-dom";
import AppNavbar from "@/components/AppNavbar";
import StarryBackground from "@/components/StarryBackground";
import ErrorBoundary from "@/components/ErrorBoundary";

const AppLayout = () => (
  <div className="min-h-dvh bg-background relative">
    <StarryBackground theme="dark" />
    <AppNavbar />
    <main className="relative z-10">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
    <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
      <p className="font-heading">⚡ StarFury AI © 2026 — Create Anything With AI</p>
    </footer>
  </div>
);

export default AppLayout;
