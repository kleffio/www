import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Boxes } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { KleffDot } from "@shared/ui/KleffDot";

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
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-black/40">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-4">
        <KleffDot size={24} />
        <span className="text-lg font-semibold text-neutral-50">Kleff</span>
      </div>

      {/* Navigation */}
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
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-kleff text-sm font-semibold text-black">
            N
          </div>
          <div className="flex-1">
            <div className="text-xs font-medium text-neutral-200">Nathan</div>
            <div className="text-[10px] text-neutral-500">nathan@kleff.io</div>
          </div>
        </div>
      </div>
    </div>
  );
}
