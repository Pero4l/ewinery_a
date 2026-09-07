import useSWR from "swr";
import apiClient from "@/lib/api-client";
import type { Transaction, PaginatedData } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type TransactionList = PaginatedData<Transaction> & {
  transactions: Transaction[];
};

export function useTransactions(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<TransactionList>(
    `/admin/transactions${query}`,
    fetcher
  );
}
