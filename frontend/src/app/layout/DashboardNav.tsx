import type { ElementType } from "react";
import { LayoutDashboard, FolderKanban, Server } from "lucide-react";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/dashboard/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  /*{
    to: "/dashboard/nodes",
    label: "Nodes",
    icon: Boxes,
  },*/
  {
    to: "/dashboard/systems",
    label: "Systems",
    icon: Server,
  },
];

export function isNavItemActive(
  pathname: string,
  item: DashboardNavItem,
): boolean {
  if (item.exact) {
    return pathname === item.to;
  }
  return pathname.startsWith(item.to);
}
