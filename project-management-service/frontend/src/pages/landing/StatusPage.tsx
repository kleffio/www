import { useState } from "react";
import { useUptime } from "@features/observability/hooks/useUptime";
import { UptimeStatusCard } from "@features/observability/components/UptimeStatusCard";
import { Section } from "@shared/ui/Section";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Skeleton } from "@shared/ui/Skeleton";
import { Pill } from "@shared/ui/Pill";
import { Button } from "@shared/ui/Button";
import { KleffDot } from "@shared/ui/KleffDot";
import { Activity, RefreshCw, Calendar, AlertTriangle } from "lucide-react";

import {
  calculateUptimePercentage,
  getUptimeStatusColor,
  getUptimeStatusText
} from "@features/observability/lib/uptime.utils";

type TimeRange = "24h" | "7d" | "30d" | "90d";

const timeRangeLabels: Record<TimeRange, string> = {
  "24h": "Last 24 Hours",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  "90d": "Last 90 Days"
};

export function StatusPage() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("24h");
  const { data, isLoading, error, refetch } = useUptime({
    duration: selectedRange,
    refreshInterval: 30000
  });

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return (
      <div className="min-h-screen">
        <Section className="pt-20 pb-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full border border-red-500/30 bg-linear-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h1 className="mb-2 text-3xl font-semibold text-neutral-50">
                Unable to Load System Status
              </h1>
              <p className="text-sm text-neutral-400">
                We're having trouble connecting to the monitoring system
              </p>
            </div>

            <SoftPanel className="mb-6">
              <div className="space-y-4">
                {/* Error Details */}
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-neutral-200">Error Details</h3>
                    <p className="rounded-lg border border-red-500/20 bg-neutral-900/50 px-3 py-2 font-mono text-sm text-neutral-400">
                      {error.message}
                    </p>
                  </div>
                </div>

                {/* Possible Causes */}
                <div className="border-t border-white/5 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-200">Possible Causes</h3>
                  <ul className="space-y-2 text-sm text-neutral-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                      <span>Prometheus server is not running or not accessible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                      <span>Network connectivity issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                      <span>CORS policy blocking the request</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-500" />
                      <span>Incorrect API endpoint configuration</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-neutral-200">
                    Troubleshooting Steps
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-400">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-[rgb(245,181,23)]">1.</span>
                      <span>
                        Verify Prometheus is running:{" "}
                        <code className="rounded bg-neutral-900/50 px-2 py-0.5 font-mono text-xs">
                          curl http://localhost:9090/api/v1/query?query=up
                        </code>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-[rgb(245,181,23)]">2.</span>
                      <span>
                        Check your API configuration in{" "}
                        <code className="rounded bg-neutral-900/50 px-2 py-0.5 font-mono text-xs">
                          .env
                        </code>{" "}
                        file
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-[rgb(245,181,23)]">3.</span>
                      <span>Ensure CORS is properly configured on your backend</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-[rgb(245,181,23)]">4.</span>
                      <span>Check browser console for additional error details</span>
                    </div>
                  </div>
                </div>
              </div>
            </SoftPanel>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={handleRefresh}
                disabled={isLoading}
                className="bg-gradient-kleff w-full rounded-full px-8 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 sm:w-auto"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Try Again
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-neutral-500">
                Need help? Check the{" "}
                <a href="/docs" className="text-[rgb(245,181,23)] hover:underline">
                  documentation
                </a>{" "}
                or{" "}
                <a href="/support" className="text-[rgb(245,181,23)] hover:underline">
                  contact support
                </a>
              </p>
            </div>
          </div>
        </Section>
      </div>
    );
  }

  const overallPercentage = data ? calculateUptimePercentage(data.uptimeHistory) : 100;
  const statusColor = getUptimeStatusColor(overallPercentage);
  const statusText = getUptimeStatusText(overallPercentage);

  return (
    <div className="min-h-screen">
      <Section className="pt-20 pb-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[rgb(245,181,23)]/30 bg-linear-to-br from-[rgb(250,215,130)]/20 to-[rgb(245,181,23)]/20 backdrop-blur-sm">
            <Activity className="h-8 w-8 text-[rgb(245,181,23)]" />
          </div>
          <h1 className="mb-2 text-3xl font-semibold text-neutral-50">Kleff System Status</h1>
          <p className="text-sm text-neutral-400">Real-time status and uptime monitoring</p>
        </div>

        <div className="mb-8">
          <SoftPanel className="text-center">
            <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white ${statusColor}`}
                >
                  <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                  {statusText}
                </div>
                {data && (
                  <div className="text-sm text-neutral-400">
                    {overallPercentage.toFixed(3)}% uptime
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                {data && (
                  <div className="text-xs text-neutral-500">
                    Updated {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </SoftPanel>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-300">Time Range</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className="focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(245,181,23)]/50"
              >
                <Pill active={selectedRange === range}>{timeRangeLabels[range]}</Pill>
              </button>
            ))}
          </div>
        </div>

        {isLoading && !data && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SoftPanel key={i}>
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-8 w-full" />
                  <div className="flex gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </SoftPanel>
            ))}
          </div>
        )}

        {data && (
          <>
            <div className="mb-4">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Infrastructure Components
              </h2>
            </div>

            <div className="space-y-4">
              {data.nodeUptimes.map((node) => (
                <SoftPanel key={node.nodeName}>
                  <UptimeStatusCard
                    serviceName={node.nodeName}
                    history={data.uptimeHistory}
                    uptimeFormatted={node.uptimeFormatted}
                    showPercentage={true}
                    duration={selectedRange}
                  />
                  <div className="mt-3 grid grid-cols-1 gap-4 border-t border-white/5 pt-3 text-xs sm:grid-cols-2">
                    <div>
                      <span className="text-neutral-500">Boot Time</span>
                      <div className="mt-1 font-medium text-neutral-300">
                        {node.bootTimeReadable}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500">Uptime</span>
                      <div className="mt-1 font-medium text-neutral-300">
                        {node.uptimeFormatted} ({node.uptimeSeconds.toFixed(0)} seconds)
                      </div>
                    </div>
                  </div>
                </SoftPanel>
              ))}
            </div>

            {/* System Summary with Kleff accent */}
            <div className="mt-8">
              <SoftPanel>
                <div className="mb-4 flex items-center gap-2">
                  <KleffDot size={16} variant="dot" />
                  <h3 className="text-sm font-semibold text-neutral-200">System Summary</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-[rgb(245,181,23)]/20">
                    <div className="text-xs text-neutral-400">Total Nodes</div>
                    <div className="mt-1 text-2xl font-semibold text-neutral-100">
                      {data.nodeUptimes.length}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-[rgb(245,181,23)]/20">
                    <div className="text-xs text-neutral-400">Average Uptime</div>
                    <div className="mt-1 text-2xl font-semibold text-neutral-100">
                      {data.averageUptimeFormatted}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-[rgb(245,181,23)]/20">
                    <div className="text-xs text-neutral-400">System Uptime</div>
                    <div className="mt-1 text-2xl font-semibold text-neutral-100">
                      {data.systemUptimeFormatted}
                    </div>
                  </div>
                </div>
              </SoftPanel>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
