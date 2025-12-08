import type { ResourceUtilization } from "@features/observability/types/metrics";
import { client } from "@shared/lib/client";

export async function getCPUUtilization(duration = "1h"): Promise<ResourceUtilization> {
  const response = await client.get<ResourceUtilization>("/api/v1/systems/cpu", {
    params: { duration }
  });
  return response.data;
}
