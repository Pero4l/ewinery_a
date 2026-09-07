import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { Notification, NotificationCounts } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export function useNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.unreadOnly) searchParams.set("unreadOnly", "true");
  const qs = searchParams.toString();

  return useSWR<{ notifications: Notification[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
    `/notifications${qs ? `?${qs}` : ""}`,
    fetcher,
    { refreshInterval: 30000 }
  );
}

export function useNotificationCounts() {
  return useSWR<NotificationCounts>(
    "/notifications/counts",
    fetcher,
    { refreshInterval: 30000 }
  );
}

export function useMarkNotificationRead() {
  return useSWRMutation(
    "/notifications",
    async (_key: string, { arg }: { arg: string }) => {
      const res = await apiClient.patch(`/notifications/${arg}/read`);
      return res.data;
    }
  );
}

export function useMarkAllNotificationsRead() {
  return useSWRMutation(
    "/notifications/read-all",
    async () => {
      const res = await apiClient.post("/notifications/read-all");
      return res.data;
    }
  );
}
