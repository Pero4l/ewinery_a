import useSWR from "swr";
import apiClient from "@/lib/api-client";
import type {
  BroadcastRecipient,
  CreateBroadcastDto,
  EmailBroadcast,
  Pagination,
} from "@/types";

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data.data);

const isRunning = (b?: EmailBroadcast) => b?.status === "RUNNING";

export interface BroadcastList {
  broadcasts: EmailBroadcast[];
  pagination: Pagination;
}

export interface BroadcastDetail {
  broadcast: EmailBroadcast;
  recipients: BroadcastRecipient[];
  pagination: Pagination;
}

export function useBroadcasts(params: Record<string, string>) {
  const query = "?" + new URLSearchParams(params).toString();
  return useSWR<BroadcastList>(`/admin/emails/broadcasts${query}`, fetcher, {
    // Poll while anything is still sending so progress counts move.
    refreshInterval: (data) => (data?.broadcasts?.some(isRunning) ? 3000 : 0),
  });
}

export function useBroadcast(id: string | null, params: Record<string, string>) {
  const query = "?" + new URLSearchParams(params).toString();
  return useSWR<BroadcastDetail>(
    id ? `/admin/emails/broadcasts/${id}${query}` : null,
    fetcher,
    { refreshInterval: (data) => (isRunning(data?.broadcast) ? 3000 : 0) }
  );
}

export async function createBroadcast(dto: CreateBroadcastDto) {
  const res = await apiClient.post("/admin/emails/broadcasts", dto);
  return res.data as { message: string; data: { broadcast: EmailBroadcast } };
}
