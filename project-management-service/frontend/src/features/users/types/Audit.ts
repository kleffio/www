export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  changes: Record<string, { old: string; new: string }>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface AuditLogPage {
  items: AuditLog[];
  total: number;
}
