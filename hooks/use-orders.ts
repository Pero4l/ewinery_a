import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { Order, PaginatedData, UpdateOrderStatusDto } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type OrderList = PaginatedData<Order> & {
  orders: Order[];
};

export function useOrders(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<OrderList>(
    `/admin/orders${query}`,
    fetcher
  );
}

export function useOrder(id: string | null) {
  return useSWR<Order>(
    id ? `/admin/orders/${id}` : null,
    fetcher
  );
}

export function useUpdateOrderStatus(id: string) {
  return useSWRMutation(
    `/admin/orders/${id}/status`,
    async (key: string, { arg }: { arg: UpdateOrderStatusDto }) => {
      const res = await apiClient.patch(key, arg);
      return res.data;
    }
  );
}

export function useCancelOrder(id: string) {
  return useSWRMutation(
    `/admin/orders/${id}/cancel`,
    async (key: string) => {
      const res = await apiClient.post(key);
      return res.data;
    }
  );
}
