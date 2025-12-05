import type { ElementType } from "react";
import { Link, useLocation } from "react-router-dom";

import { cn } from "@shared/lib/utils";
import { KleffDot } from "@shared/ui/KleffDot";
import { UserMenu } from "@shared/ui/UserMenu";
import { DASHBOARD_NAV_ITEMS, isNavItemActive } from "@app/layout/DashboardNav";

interface SidebarItemProps {
  to: string;
  icon: ElementType;
  label: string;
  isActive?: boolean;
}

function SidebarItem({ to, icon: Icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 transition-all",
        isActive
          ? "bg-white/10 text-white"
          : "text-neutral-400 hover:bg-white/5 hover:text-white/90"
      )}
    >
      {isActive && (
        <span className="absolute top-0 left-0 h-full w-0.5 rounded-r bg-linear-to-b from-[#FFD56A] to-[#B8860B] shadow-[0_0_6px_2px_rgba(255,213,106,0.35)]" />
      )}

      <div className="flex h-6 w-6 items-center justify-center">
        <Icon className="h-4 w-4 shrink-0" />
      </div>

      <span className="hidden text-sm font-medium lg:inline">{label}</span>
    </Link>
  );
}

export function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-screen w-16 flex-col border-r border-white/10 bg-black/40 lg:w-64">
      <Link
        to="/"
        className="flex h-14 items-center justify-center border-b border-white/10 px-3 lg:justify-start"
      >
        <div className="flex items-center gap-2">
          <KleffDot variant="full" size={22} />
          <span className="hidden text-[13px] font-semibold tracking-[0.32em] text-neutral-100 lg:inline">
            LEFF
          </span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {DASHBOARD_NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={isNavItemActive(location.pathname, item)}
          />
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 lg:p-4">
        <UserMenu variant="full" align="left" dropdownPosition="top" />
      </div>
    </aside>
  );
}
