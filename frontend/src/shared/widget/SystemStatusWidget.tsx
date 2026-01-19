import { SoftPanel } from "@shared/ui/SoftPanel";
import { Skeleton } from "@shared/ui/Skeleton";
import { Activity, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import { UptimeStatusCard } from "@features/observability/components/UptimeStatusCard";
import { useUptime } from "@features/observability/hooks/useUptime";
import { calculateUptimePercentage } from "@features/observability/lib/uptime.utils";

export function SystemStatusWidget() {
  const { data, isLoading, error } = useUptime({
    duration: "24h",
    refreshInterval: 60000
  });

  if (error) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <SoftPanel>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </SoftPanel>
    );
  }

  const overallPercentage = calculateUptimePercentage(data.uptimeHistory);
  const isOperational = overallPercentage >= 99.9;

  return (
    <SoftPanel>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-200">System Status</h3>
        </div>
        <Link
          to="/status"
          className="flex items-center gap-1 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
        >
          View full status
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white ${
            isOperational ? "bg-green-500" : "bg-yellow-500"
          }`}
        >
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-white" />
          {isOperational ? "All Systems Operational" : "Degraded Performance"}
        </div>
        <span className="text-xs text-neutral-400">
          Last 24 hours • {overallPercentage.toFixed(2)}% uptime
        </span>
      </div>

      <div className="space-y-4">
        {data.nodeUptimes.slice(0, 3).map((node) => (
          <UptimeStatusCard
            key={node.nodeName}
            serviceName={node.nodeName}
            history={data.uptimeHistory}
            uptimeFormatted={node.uptimeFormatted}
            showPercentage={false}
          />
        ))}
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400">System uptime</span>
          <span className="font-medium text-neutral-200">{data.systemUptimeFormatted}</span>
        </div>
      </div>
    </SoftPanel>
  );
}
