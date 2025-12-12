import { client } from "@shared/lib/client";
import type { AuditLogPage } from "@features/users/types/Audit";

export async function getMyAuditLogs(limit: number, offset: number): Promise<AuditLogPage> {
  const response = await client.get<AuditLogPage>("/api/v1/users/me/audit", {
    params: { limit, offset }
  });

  return response.data;
}
