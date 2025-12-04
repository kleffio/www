import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@app/layout/DashboardSidebar";
import { DashboardHeader } from "@app/layout/DashboardHeader";

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-kleff-bg text-foreground">
      <aside className="hidden lg:flex">
        <DashboardSidebar />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="lg:hidden">
          <DashboardHeader />
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
