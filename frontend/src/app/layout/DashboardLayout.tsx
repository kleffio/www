import { Outlet } from "react-router-dom";
import { Sidebar } from "./DashboardHeader";

export function DashboardLayout() {
  return (
    <div className="bg-kleff-bg text-foreground flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex-1 isolate">
        <div className="pointer-events-none absolute inset-0 -z-20">
          <div className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
          <div className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-white/10 via-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black via-transparent" />

        <main className="relative h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
