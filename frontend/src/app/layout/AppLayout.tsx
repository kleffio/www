import { Outlet } from "react-router-dom";
import { AppFooter } from "@app/layout/components/AppFooter";
import { AppBackground } from "./components/AppBackground";

import { AppShellNav } from "@app/navigation/AppShellNav";

export function AppLayout() {
  return (
    <div className="bg-kleff-bg text-foreground relative flex min-h-screen flex-col">
      <header className="sticky top-0 z-50">
        <AppShellNav />
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
