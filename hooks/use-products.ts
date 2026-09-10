import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { Product, PaginatedData } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type ProductList = PaginatedData<Product> & {
  products: Product[];
};

export function useProducts(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<ProductList>(
    `/admin/products${query}`,
    fetcher
  );
}

export function useProduct(id: string | null) {
  return useSWR<Product>(
    id ? `/admin/products/${id}` : null,
    async (url: string) => {
      const data = await fetcher(url);
      return data.product ?? data;
    }
  );
}

export function useCreateProduct() {
  return useSWRMutation(
    "/admin/products",
    async (_key: string, { arg }: { arg: FormData }) => {
      const res = await apiClient.post("/admin/products", arg, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }
  );
}

export function useUpdateProduct(id: string) {
  return useSWRMutation(
    `/admin/products/${id}`,
    async (key: string, { arg }: { arg: FormData | Record<string, unknown> }) => {
      const isFormData = arg instanceof FormData;
      const res = await apiClient.patch(key, arg, {
        headers: isFormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      });
      return res.data;
    }
  );
}

export function useDeleteProduct() {
  return useSWRMutation(
    "/admin/products",
    async (_key: string, { arg }: { arg: string }) => {
      const res = await apiClient.delete(`/admin/products/${arg}`);
      return res.data;
    }
  );
}

export function useUpdateStock(id: string) {
  return useSWRMutation(
    `/admin/products/${id}/stock`,
    async (key: string, { arg }: { arg: Record<string, unknown> }) => {
      const res = await apiClient.patch(key, arg);
      return res.data;
    }
  );
}
