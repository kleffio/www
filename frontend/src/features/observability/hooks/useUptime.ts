import { useState, useEffect } from "react";

import type { UptimeMetrics } from "@features/observability/types/uptime";
import { getUptimeMetrics } from "@features/observability/api/getUptimeMetrics";

interface UseUptimeOptions {
  duration?: string;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseUptimeReturn {
  data: UptimeMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUptime(options: UseUptimeOptions = {}): UseUptimeReturn {
  const { duration = "24h", refreshInterval = 60000, enabled = true } = options;

  const [data, setData] = useState<UptimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const metrics = await getUptimeMetrics(duration);
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch uptime"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, refreshInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}
