import type { UptimeMetrics } from "@features/observability/types/uptime";
import { client } from "@shared/lib/client";

export async function getUptimeMetrics(duration = "1h"): Promise<UptimeMetrics> {
  const response = await client.get<UptimeMetrics>("/api/v1/systems/uptime", {
    params: { duration }
  });
  return response.data;
}
