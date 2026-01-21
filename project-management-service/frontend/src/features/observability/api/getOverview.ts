import type { ClusterOverview } from "@features/observability/types/metrics";
import { client } from "@shared/lib/client";

export async function getOverview(duration = "1h"): Promise<ClusterOverview> {
  const response = await client.get<ClusterOverview>("/api/v1/systems/overview", {
    params: { duration }
  });
  return response.data;
}
