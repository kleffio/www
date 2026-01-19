import type { TimeSeriesDataPoint } from "@features/observability/types/uptime";

export function calculateUptimePercentage(history: TimeSeriesDataPoint[]): number {
  if (history.length === 0) return 100;

  const recordedPoints = history.filter((point) => point.value >= 0);
  if (recordedPoints.length === 0) return 0;

  const uptimeCount = recordedPoints.filter((point) => point.value > 0).length;
  return (uptimeCount / recordedPoints.length) * 100;
}

export function getUptimeStatusColor(percentage: number): string {
  if (percentage >= 99.9) return "bg-green-500";
  if (percentage >= 99.0) return "bg-yellow-500";
  if (percentage >= 95.0) return "bg-orange-500";
  return "bg-red-500";
}

export function getUptimeStatusText(percentage: number): string {
  if (percentage >= 99.9) return "Operational";
  if (percentage >= 99.0) return "Degraded";
  if (percentage >= 95.0) return "Partial Outage";
  return "Major Outage";
}

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)(h|d)$/);
  if (!match) return 24 * 60 * 60 * 1000;

  const value = parseInt(match[1]);
  const unit = match[2];

  if (unit === "h") return value * 60 * 60 * 1000;
  if (unit === "d") return value * 24 * 60 * 60 * 1000;

  return 24 * 60 * 60 * 1000;
}

export function normalizeUptimeHistory(
  history: TimeSeriesDataPoint[],
  duration: string,
  barsToShow: number = 90
): TimeSeriesDataPoint[] {
  const durationMs = parseDurationToMs(duration);
  const now = Date.now();
  const intervalMs = durationMs / barsToShow;
  const startTime = now - durationMs;

  if (history.length === 0) {
    return Array.from({ length: barsToShow }, (_, i) => ({
      timestamp: startTime + i * intervalMs,
      value: -1
    }));
  }

  const timestamps = history.map((p) => p.timestamp);
  const monitoringStart = Math.min(...timestamps);
  const monitoringEnd = Math.max(...timestamps);

  return Array.from({ length: barsToShow }, (_, i) => {
    const timestamp = startTime + i * intervalMs;
    const bucketEnd = timestamp + intervalMs;

    const isMonitored =
      (timestamp >= monitoringStart && timestamp <= monitoringEnd) ||
      (bucketEnd >= monitoringStart && bucketEnd <= monitoringEnd) ||
      (timestamp <= monitoringStart && bucketEnd >= monitoringEnd);

    if (!isMonitored) {
      return { timestamp, value: -1 };
    }

    const hasDowntime = history.some(
      (point) => point.value === 0 && point.timestamp >= timestamp && point.timestamp < bucketEnd
    );

    return {
      timestamp,
      value: hasDowntime ? 0 : 1
    };
  });
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function getUptimeBarColor(value: number): string {
  if (value < 0) return "bg-neutral-700";
  if (value > 0) return "bg-green-500";
  return "bg-red-500";
}

export function getUptimeStatusLabel(value: number): string {
  if (value < 0) return "Unrecorded";
  if (value > 0) return "Operational";
  return "Down";
}

export function chunkUptimeHistory(
  history: TimeSeriesDataPoint[],
  chunkSize: number = 90,
  duration: string = "24h"
): TimeSeriesDataPoint[] {
  return normalizeUptimeHistory(history, duration, chunkSize);
}
