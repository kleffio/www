import type { HTMLAttributes, ReactNode } from "react";

interface SoftPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function SoftPanel({ children, className = "", ...rest }: SoftPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
