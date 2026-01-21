import { client } from "@shared/lib/client";

export interface DatabaseIOMetrics {
  readOps: number;
  writeOps: number;
  readThroughput: number;
  writeThroughput: number;
  latency: number;
  timestamp: string;
}

export async function getDatabaseIOMetrics(duration = "1h"): Promise<DatabaseIOMetrics> {
  const response = await client.get<DatabaseIOMetrics>("/api/v1/systems/database-io", {
    params: { duration }
  });
  return response.data;
}
