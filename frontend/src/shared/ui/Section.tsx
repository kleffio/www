import * as React from "react";
import { cn } from "@shared/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, ...props }, ref) => (
    <section ref={ref} className={cn("app-container", className)} {...props}>
      {children}
    </section>
  )
);
Section.displayName = "Section";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  title: string;
  description?: string;
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, label, title, description, ...props }, ref) => (
    <div ref={ref} className={cn("mb-6 text-left", className)} {...props}>
      {label && (
        <p className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">{label}</p>
      )}
      <h2 className="mt-2 text-2xl font-semibold text-neutral-50">{title}</h2>
      {description && <p className="mt-2 max-w-2xl text-sm text-neutral-400">{description}</p>}
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

export { Section, SectionHeader };
