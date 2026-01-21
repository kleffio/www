import { client } from "@shared/lib/client";

import type { SystemUptimeResponse } from "@features/observability/types/uptime";

export async function getSystemUptime(): Promise<SystemUptimeResponse> {
  const response = await client.get<SystemUptimeResponse>("/api/v1/systems/system-uptime");
  return response.data;
}
