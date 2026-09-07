"use client";

import { useState } from "react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, mutate } = useNotifications({ page, limit: 20 });
  const { trigger: markRead } = useMarkNotificationRead();
  const { trigger: markAllRead } = useMarkAllNotificationsRead();

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    mutate();
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    toast.success("All notifications marked as read");
    mutate();
  };

  if (isLoading) return <LoadingPage />;

  const notifications = data?.notifications || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">View your notifications</p>
        </div>
        {hasUnread && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer",
                !notification.isRead && "bg-[#722f37]/5 border-[#722f37]/20"
              )}
              onClick={() => !notification.isRead && handleMarkRead(notification.id)}
            >
              <div className="flex items-start gap-3">
                {!notification.isRead && (
                  <div className="h-2 w-2 rounded-full bg-[#722f37] mt-2 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notification.body}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(notification.createdAt)}
                    </p>
                    <span className="text-xs text-muted-foreground capitalize">
                      {notification.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <DataTablePagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
            onLimitChange={() => {}}
          />
        </div>
      )}
    </div>
  );
}
