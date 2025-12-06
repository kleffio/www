import { Outlet } from "react-router-dom";
import { DashboardNav } from "@app/layout/DashboardNav";
import { TokenDebugPanel } from "@features/auth/components/TokenDebugPanel";
import { AppBackground } from "@app/layout/AppBackground";

export function DashboardLayout() {
  return (
    <div className="bg-kleff-bg text-foreground relative flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* Navigation - renders mobile header on small screens, sidebar on large screens */}
      <DashboardNav />

      {/* Main content area */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">
          <AppBackground />
          <Outlet />
        </main>
      </div>

      {/* Debug panel */}
      <div className="relative z-20">
        <TokenDebugPanel />
      </div>
    </div>
  );
}
