export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "order" | "promo" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface NotificationCounts {
  total: number;
  unread: number;
}
