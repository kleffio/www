import { cn } from "@shared/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}
