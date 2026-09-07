import { User } from "./auth";

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  orderId?: string;
  orderNumber?: string;
  user?: User;
  userId: string;
  assignedTo?: User;
  assignedToId?: string;
  messages: TicketMessage[];
  createdAt: string;
  updatedAt?: string;
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface TicketMessage {
  id: string;
  message: string;
  sender: User;
  senderId: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface ReplyTicketDto {
  message: string;
  isInternalNote?: boolean;
}

export interface UpdateTicketDto {
  status?: TicketStatus;
  note?: string;
  agentId?: string;
}
