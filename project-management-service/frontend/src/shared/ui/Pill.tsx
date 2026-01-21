import * as React from "react";
import { cn } from "@shared/lib/utils";

type PillProps = {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
};

export function Pill({ children, active = false, className }: PillProps) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition";
  const state = active
    ? "bg-white/10 text-white"
    : "text-neutral-400 hover:bg-white/5 hover:text-white";

  return <span className={cn(base, state, className)}>{children}</span>;
}
