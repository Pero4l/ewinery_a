import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { Ticket, PaginatedData, ReplyTicketDto, UpdateTicketDto } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type TicketList = PaginatedData<Ticket> & {
  tickets: Ticket[];
};

export function useTickets(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<TicketList>(
    `/admin/tickets${query}`,
    fetcher
  );
}

export function useTicket(id: string | null) {
  return useSWR<Ticket>(
    id ? `/admin/tickets/${id}` : null,
    fetcher
  );
}

export function useReplyTicket(id: string) {
  return useSWRMutation(
    `/admin/tickets/${id}/replies`,
    async (key: string, { arg }: { arg: ReplyTicketDto }) => {
      const res = await apiClient.post(key, arg);
      return res.data;
    }
  );
}

export function useUpdateTicket(id: string) {
  return useSWRMutation(
    `/admin/tickets/${id}`,
    async (key: string, { arg }: { arg: UpdateTicketDto }) => {
      const method = arg.status ? "patch" : arg.agentId ? "patch" : "patch";
      const url = arg.status
        ? `/admin/tickets/${id}/status`
        : arg.agentId
        ? `/admin/tickets/${id}/assign`
        : key;
      const res = await apiClient[method](url, arg);
      return res.data;
    }
  );
}
