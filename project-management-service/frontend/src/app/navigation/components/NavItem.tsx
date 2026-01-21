import { Link } from "react-router-dom";
import type { ElementType } from "react";
import { cn } from "@shared/lib/utils";

interface NavItemProps {
  to: string;
  label: string;
  icon: ElementType;
  isActive?: boolean;
  onClick?: () => void;
  variant?: "sidebar" | "mobile";
}

export function NavItem({
  to,
  label,
  icon: Icon,
  isActive,
  onClick,
  variant = "sidebar"
}: NavItemProps) {
  if (variant === "mobile") {
    return (
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-linear-to-r from-white/12 to-white/5 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
            : "text-neutral-300 hover:bg-white/5 hover:text-white"
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-200",
            isActive && "border-[#FFD56A]/70 bg-[#FFD56A]/10 text-[#FFD56A]"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
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
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
