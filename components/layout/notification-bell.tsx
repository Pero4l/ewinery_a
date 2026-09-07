"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useNotifications,
  useNotificationCounts,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { data: counts } = useNotificationCounts();
  const { data: notificationData, mutate: mutateNotifications } =
    useNotifications({ limit: 20 });
  const { trigger: markRead } = useMarkNotificationRead();
  const { trigger: markAllRead } = useMarkAllNotificationsRead();

  const unreadCount = counts?.unread || 0;
  const notifications = notificationData?.notifications || [];

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    mutateNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    mutateNotifications();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-[#722f37] hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No notifications yet
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() =>
                    !notification.isRead && handleMarkRead(notification.id)
                  }
                  className={cn(
                    "w-full text-left px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition-colors",
                    !notification.isRead && "bg-[#722f37]/5"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-[#722f37] mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
