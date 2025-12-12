import { Outlet } from "react-router-dom";
import { TokenDebugPanel } from "@features/auth/components/TokenDebugPanel";
import { AppBackground } from "@app/layout/components/AppBackground";
import { AppShellNav } from "@app/navigation/AppShellNav";

export function DashboardLayout() {
  return (
    <div className="bg-kleff-bg text-foreground relative flex h-screen flex-col overflow-hidden lg:flex-row">
      <header>
        <AppShellNav />
      </header>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <AppBackground />
          <Outlet />
        </main>
      </div>

      {import.meta.env.DEV && (
        <div className="relative z-20">
          <TokenDebugPanel />
        </div>
      )}
    </div>
  );
}
