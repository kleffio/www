import type { HTMLAttributes } from "react";
import { cn } from "@shared/lib/utils";

type SpinnerProps = {
  size?: number;
  label?: string;
} & HTMLAttributes<HTMLDivElement>;

export function Spinner({ size = 40, label = "Loading…", className, ...props }: SpinnerProps) {
  const dimension = { width: size, height: size };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("inline-flex flex-col items-center justify-center gap-2", className)}
      {...props}
    >
      <div
        className="relative inline-flex items-center justify-center"
        style={{ ...dimension, transform: "translateZ(0)", willChange: "transform" }}
      >
        {/* Bright golden glow background */}
        <div
          className="absolute rounded-full opacity-60 blur-xl"
          style={{
            inset: "4px",
            background: "radial-gradient(circle, rgba(245, 181, 23, 0.5) 0%, transparent 70%)"
          }}
        />

        {/* Main spinning ring - much brighter */}
        <div
          className="absolute animate-spin rounded-full"
          style={{
            inset: "2px",
            border: "3px solid transparent",
            borderTopColor: "rgb(245, 181, 23)",
            borderRightColor: "rgb(245, 181, 23)",
            filter: "drop-shadow(0 0 8px rgba(245, 181, 23, 0.8))"
          }}
        />

        {/* Secondary ring for depth */}
        <div
          className="absolute rounded-full"
          style={{
            inset: "6px",
            border: "2px solid transparent",
            borderBottomColor: "rgba(250, 215, 130, 0.6)",
            borderLeftColor: "rgba(250, 215, 130, 0.6)",
            animation: "spin 1.6s linear infinite reverse"
          }}
        />

        {/* Inner core with better contrast */}
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            width: "50%",
            height: "50%",
            background:
              "linear-gradient(135deg, rgb(59, 50, 39) 0%, rgb(21, 18, 15) 50%, rgb(0, 0, 0) 100%)",
            border: "1px solid rgba(245, 181, 23, 0.3)",
            boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 12px rgba(245, 181, 23, 0.2)"
          }}
        >
          {/* Bright center glow */}
          <div
            className="absolute rounded-full"
            style={{
              inset: "30%",
              background: "radial-gradient(circle, rgba(245, 181, 23, 0.9) 0%, transparent 70%)",
              filter: "blur(4px)"
            }}
          />
        </div>

        {/* Animated spark particles - brighter */}
        <div
          className="pointer-events-none absolute h-2 w-2 rounded-full"
          style={{
            top: "-4px",
            right: "18%",
            background: "rgb(245, 181, 23)",
            boxShadow: "0 0 12px rgba(245, 181, 23, 1)",
            animation: "spark 1.6s ease-out infinite"
          }}
        />
        <div
          className="pointer-events-none absolute h-2 w-2 rounded-full"
          style={{
            top: "45%",
            right: "-4px",
            background: "rgb(250, 215, 130)",
            boxShadow: "0 0 12px rgba(250, 215, 130, 0.9)",
            animation: "spark 1.9s ease-out infinite 0.25s"
          }}
        />
        <div
          className="pointer-events-none absolute h-2 w-2 rounded-full"
          style={{
            bottom: "-4px",
            left: "10%",
            background: "rgb(250, 215, 130)",
            boxShadow: "0 0 12px rgba(250, 215, 130, 0.8)",
            animation: "spark 2.1s ease-out infinite 0.5s"
          }}
        />
      </div>

      <span className="sr-only">{label}</span>

      <style>{`
        @keyframes spark {
          0% {
            opacity: 0;
            transform: scale(0.4);
          }
          15% {
            opacity: 1;
          }
          50% {
            opacity: 0;
            transform: translate(4px, -6px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: scale(0.4);
          }
        }
      `}</style>
    </div>
  );
}
