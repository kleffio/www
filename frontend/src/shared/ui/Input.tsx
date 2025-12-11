import { cn } from "@shared/lib/utils";
import type { InputHTMLAttributes } from "react";
import { forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white",
          "placeholder:text-neutral-500",
          "focus:border-transparent focus:ring-2 focus:ring-blue-500/50 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
