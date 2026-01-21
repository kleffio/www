import {
  calculateUptimePercentage,
  getUptimeStatusColor,
  getUptimeStatusText
} from "@features/observability/lib/uptime.utils";

import type { TimeSeriesDataPoint } from "@features/observability/types/metrics";

import { UptimeBar } from "@features/observability/components/UptimeBar";

interface UptimeStatusCardProps {
  serviceName: string;
  history: TimeSeriesDataPoint[];
  uptimeFormatted: string;
  showPercentage?: boolean;
  duration?: string;
  className?: string;
}

export function UptimeStatusCard({
  serviceName,
  history,
  uptimeFormatted,
  showPercentage = true,
  duration = "24h",
  className = ""
}: UptimeStatusCardProps) {
  const uptimePercentage = calculateUptimePercentage(history);
  const statusColor = getUptimeStatusColor(uptimePercentage);
  const statusText = getUptimeStatusText(uptimePercentage);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-200">{serviceName}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium text-white ${statusColor}`}
          >
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-white" />
            {statusText}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          {showPercentage && (
            <span className="font-medium">{uptimePercentage.toFixed(2)}% uptime</span>
          )}
          <span>Running for {uptimeFormatted}</span>
        </div>
      </div>
      <UptimeBar history={history} duration={duration} />
    </div>
  );
}
