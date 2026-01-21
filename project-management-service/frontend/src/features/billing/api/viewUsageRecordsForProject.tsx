import { client } from "@shared/lib/client";
import type { UsageRecord } from "@features/billing/types/UsageRecord";

export default async function fetchUsageRecords(projectId: string): Promise<UsageRecord[]> {
  const res = await client.get<UsageRecord[]>(`/api/v1/billing/${projectId}/usage-records/`);
  return res.data;
}
