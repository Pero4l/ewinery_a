export type BroadcastStatus = "RUNNING" | "COMPLETED" | (string & {});
export type BroadcastRecipientStatus = "PENDING" | "SENT" | "RETRY" | "FAILED";

export interface EmailBroadcast {
  id: string;
  subject: string;
  content?: string;
  status: BroadcastStatus;
  total: number;
  sent: number;
  pending: number;
  retrying: number;
  failed: number;
  createdBy?: string;
  createdAt: string;
  completedAt: string | null;
}

export interface BroadcastRecipient {
  userId: string;
  email: string;
  name?: string | null;
  status: BroadcastRecipientStatus;
  attempts: number;
  lastError: string | null;
  nextAttemptAt: string | null;
  sentAt: string | null;
}

export interface CreateBroadcastDto {
  subject: string;
  content: string;
}
