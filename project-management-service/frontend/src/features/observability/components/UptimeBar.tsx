import { useMemo } from "react";

import {
  chunkUptimeHistory,
  getUptimeBarColor,
  getUptimeStatusLabel
} from "@features/observability/lib/uptime.utils";
import type { TimeSeriesDataPoint } from "@features/observability/types/metrics";

interface UptimeBarProps {
  history: TimeSeriesDataPoint[];
  barsToShow?: number;
  duration?: string;
  className?: string;
}

export function UptimeBar({
  history,
  barsToShow = 90,
  duration = "24h",
  className = ""
}: UptimeBarProps) {
  const displayData = useMemo(() => {
    return chunkUptimeHistory(history, barsToShow, duration);
  }, [history, barsToShow, duration]);

  if (displayData.length === 0) {
    return (
      <div className={`flex gap-0.5 ${className}`}>
        {Array.from({ length: barsToShow }).map((_, i) => (
          <div key={i} className="h-8 flex-1 rounded-[2px] bg-neutral-800/80" title="No data" />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex gap-0.5 ${className}`}>
      {displayData.map((point, index) => {
        const colorClass = getUptimeBarColor(point.value);
        const statusLabel = getUptimeStatusLabel(point.value);
        const isUnrecorded = point.value < 0;
        const isDown = point.value === 0;
        const date = new Date(point.timestamp);

        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });

        return (
          <div
            key={index}
            className={`group relative h-8 flex-1 rounded-[2px] transition-all duration-200 ${colorClass} ${
              isUnrecorded ? "opacity-40" : isDown ? "opacity-50" : "opacity-100"
            } cursor-pointer hover:z-10 hover:scale-110 hover:opacity-90`}
          >
            <div
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden group-hover:block"
              style={{
                transform: "translateX(-50%)",
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale"
              }}
            >
              <div
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 whitespace-nowrap shadow-2xl"
                style={{
                  transform: "translateZ(0)",
                  backfaceVisibility: "hidden"
                }}
              >
                <div className="text-xs font-semibold text-white">{formattedDate}</div>
                <div className="text-xs text-neutral-400">{formattedTime}</div>
                <div
                  className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${
                    isUnrecorded ? "text-neutral-400" : isDown ? "text-red-400" : "text-green-400"
                  }`}
                >
                  <span
                    className={`inline-flex h-1.5 w-1.5 rounded-full ${
                      isUnrecorded ? "bg-neutral-400" : isDown ? "bg-red-400" : "bg-green-400"
                    }`}
                  />
                  {statusLabel}
                </div>
              </div>
              <div
                className="absolute top-full left-1/2 -mt-px"
                style={{ transform: "translateX(-50%)" }}
              >
                <div className="border-[5px] border-transparent border-t-neutral-950" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
