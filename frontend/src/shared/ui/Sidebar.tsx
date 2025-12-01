import { cn } from "@shared/lib/utils";
import { KleffDot } from "@shared/ui/KleffDot";
import { Boxes, FolderKanban, LayoutDashboard, Server } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-white/10 text-neutral-50"
          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-16 flex-col border-r border-white/10 bg-black/40 sm:w-64">
<<<<<<< HEAD
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <KleffDot size={24} />
        <span className="hidden text-lg font-semibold text-neutral-50 sm:inline">Kleff</span>
      </div>
=======
      <Link
        to="/dashboard"
        className="flex items-center justify-center gap-2 px-3 py-4 sm:justify-start"
      >
        <KleffDot variant="full" size={22} />

        <span className="text-foreground hidden text-[14px] font-semibold tracking-[0.32em] uppercase sm:inline">
          LEFF
        </span>
      </Link>
>>>>>>> 9abad9539028c91216b9890f886d20e1d87a44c1

      <nav className="flex-1 space-y-1 p-3">
        <SidebarItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          isActive={location.pathname === "/dashboard"}
        />
        <SidebarItem
          to="/dashboard/projects"
          icon={FolderKanban}
          label="Projects"
          isActive={location.pathname === "/dashboard/projects"}
        />
        <SidebarItem
          to="/dashboard/nodes"
          icon={Boxes}
          label="Nodes"
          isActive={location.pathname === "/dashboard/nodes"}
        />
        <SidebarItem
          to="/dashboard/system"
          icon={Server}
          label="System"
          isActive={location.pathname === "/dashboard/system"}
        />
      </nav>

      <div className="border-t border-white/10 p-3 sm:p-4">
        <div className="flex items-center justify-center gap-3 rounded-lg bg-white/5 px-2 py-2 sm:justify-start sm:px-3">
          <div className="bg-gradient-kleff flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-black">
            N
          </div>
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="truncate text-xs font-medium text-neutral-200">Nathan</div>
            <div className="truncate text-[10px] text-neutral-500">nathan@kleff.io</div>
          </div>
        </div>
      </div>
    </div>
  );
}
