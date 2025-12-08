import type { MetricCard } from "@features/observability/types/metrics";
import { client } from "@shared/lib/client";

export async function getPodsMetric(duration = "1h"): Promise<MetricCard> {
  const response = await client.get<MetricCard>("/api/v1/systems/pods-metric", {
    params: { duration }
  });
  return response.data;
}
