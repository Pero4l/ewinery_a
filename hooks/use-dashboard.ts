import useSWR from "swr";
import apiClient from "@/lib/api-client";
import type { DashboardStats, SalesTrend, LowStockProduct } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export function useDashboardStats(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return useSWR<DashboardStats>(
    `/admin/stats${qs ? `?${qs}` : ""}`,
    fetcher
  );
}

export function useSalesTrend(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return useSWR<SalesTrend[]>(
    `/admin/sales-trend${qs ? `?${qs}` : ""}`,
    fetcher
  );
}

export function useLowStockProducts() {
  return useSWR<LowStockProduct[]>("/admin/products/low-stock", fetcher);
}
