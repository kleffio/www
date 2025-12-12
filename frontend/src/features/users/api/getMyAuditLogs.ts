import { client } from "@shared/lib/client";

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: string;
  changes?: Record<string, { old: string; new: string }>;
}

export async function getMyAuditLogs(limit: number, offset: number): Promise<AuditLog[]> {
  const response = await client.get<AuditLog[]>("/api/v1/users/me/audit", {
    params: { limit, offset }
  });

  return response.data ?? [];
}
