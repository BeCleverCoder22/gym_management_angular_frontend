export interface AuditRecord {
  id: number;
  actor: string;
  action: string;
  resourceType?: string;
  resourceId?: string | number;
  occurredAt: string;
}

export interface NotificationOutboxItem {
  id: number;
  status: string;
  attempts: number;
  nextAttemptAt?: string;
  lastError?: string;
}