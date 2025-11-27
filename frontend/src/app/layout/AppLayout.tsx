import { Outlet } from "react-router-dom";
import { AppHeader } from "@app/layout/AppHeader";
import { AppFooter } from "@app/layout/AppFooter";

export function AppLayout() {
  return (
    <div className="bg-kleff-bg text-foreground flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
}
