import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@app/layout/DashboardSidebar";
import { DashboardHeader } from "@app/layout/DashboardHeader";
import { TokenDebugPanel } from "@features/auth/components/TokenDebugPanel";
import { AppBackground } from "@app/layout/AppBackground";

export function DashboardLayout() {
  return (
    <div className="bg-kleff-bg text-foreground relative flex h-screen overflow-hidden">
      <aside className="relative z-10 hidden lg:flex">
        <DashboardSidebar />
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <div className="lg:hidden">
          <DashboardHeader />
        </div>

        <main className="flex-1 overflow-auto">
          <AppBackground />
          <Outlet />
        </main>
      </div>

      <div className="relative z-20">
        <TokenDebugPanel />
      </div>
    </div>
  );
}
