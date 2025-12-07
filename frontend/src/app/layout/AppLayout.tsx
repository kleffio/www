import { Outlet } from "react-router-dom";
import { AppHeader } from "@app/layout/AppHeader";
import { AppFooter } from "@app/layout/AppFooter";
import { AppBackground } from "./AppBackground";

export function AppLayout() {
  return (
    <div className="bg-kleff-bg text-foreground relative flex min-h-screen flex-col">
      <header className="relative z-50">
        <AppHeader />
      </header>

      <main className="relative z-0 flex-1">
        <AppBackground />
        <Outlet />
      </main>

      <footer className="relative z-20">
        <AppFooter />
      </footer>
    </div>
  );
}
