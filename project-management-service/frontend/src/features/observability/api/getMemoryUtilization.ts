import type { ResourceUtilization } from "@features/observability/types/metrics";
import { client } from "@shared/lib/client";

export async function getMemoryUtilization(duration = "1h"): Promise<ResourceUtilization> {
  const response = await client.get<ResourceUtilization>("/api/v1/systems/memory", {
    params: { duration }
  });
  return response.data;
}
