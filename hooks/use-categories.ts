import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { Category } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export function useCategories() {
  return useSWR<{ categories: Category[] }>("/admin/categories", fetcher);
}

export function useCategory(id: string | null) {
  return useSWR<Category>(
    id ? `/admin/categories/${id}` : null,
    fetcher
  );
}

export function useCreateCategory() {
  return useSWRMutation(
    "/admin/categories",
    async (_key: string, { arg }: { arg: Record<string, unknown> }) => {
      const res = await apiClient.post("/admin/categories", arg);
      return res.data;
    }
  );
}

export function useUpdateCategory(id: string) {
  return useSWRMutation(
    `/admin/categories/${id}`,
    async (key: string, { arg }: { arg: Record<string, unknown> }) => {
      const res = await apiClient.patch(key, arg);
      return res.data;
    }
  );
}

export function useDeleteCategory() {
  return useSWRMutation(
    "/admin/categories",
    async (_key: string, { arg }: { arg: string }) => {
      const res = await apiClient.delete(`/admin/categories/${arg}`);
      return res.data;
    }
  );
}
