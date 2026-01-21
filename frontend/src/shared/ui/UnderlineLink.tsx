import * as React from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "@shared/lib/utils";

type UnderlineLinkProps = {
  to: string;
  children: React.ReactNode;
  className?: string;
} & Omit<LinkProps, "to" | "children" | "className">;

export function UnderlineLink({ to, children, className, ...props }: UnderlineLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "group/navlink relative inline-flex items-center text-neutral-300 transition-colors hover:text-white",
        className
      )}
      {...props}
    >
      {children}
      <span className="bg-gradient-kleff pointer-events-none absolute right-0 -bottom-0.5 left-0 h-0.5 origin-center scale-x-0 transform rounded-full opacity-0 transition duration-200 ease-out group-hover/navlink:scale-x-100 group-hover/navlink:opacity-100" />
    </Link>
  );
}
