import { Link, useLocation } from "react-router-dom";
import { cn } from "@shared/lib/utils";
import { KleffDot } from "@shared/ui/KleffDot";
import {
  DASHBOARD_NAV_ITEMS,
  isNavItemActive,
} from "@app/layout/DashboardNav";

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
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
          : "text-neutral-400 hover:bg-white/5 hover:text-white/90",
      )}
    >
      {isActive && (
        <span
          className="absolute left-0 top-0 h-full w-[2px] rounded-r 
          bg-gradient-to-b from-[#FFD56A] to-[#B8860B]
          shadow-[0_0_6px_2px_rgba(255,213,106,0.35)]"
        />
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
        to="/dashboard"
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
        <div className="flex items-center justify-center gap-3 rounded-lg bg-white/5 px-2 py-2 lg:justify-start lg:px-3">
          <div className="bg-gradient-kleff flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-black">
            N
          </div>
          <div className="hidden min-w-0 flex-1 lg:block">
            <div className="truncate text-xs font-medium text-neutral-200">
              Nathan
            </div>
            <div className="truncate text-[10px] text-neutral-500">
              nathan@kleff.io
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
