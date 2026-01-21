import { useLocation } from "react-router-dom";
import { AppHeader } from "@app/layout/AppHeader";
import { DashboardNav } from "@app/layout/DashboardNav";

export function AppShellNav() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  if (isDashboard) {
    return <DashboardNav />;
  }

  return <AppHeader />;
}
