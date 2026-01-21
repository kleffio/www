import type { NodeMetric } from "@features/observability/types/metrics";
import { client } from "@shared/lib/client";

export async function getNodes(): Promise<NodeMetric[]> {
  const response = await client.get<NodeMetric[]>("/api/v1/systems/nodes");
  return response.data;
}
