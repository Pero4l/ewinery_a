import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { UserListItem, PaginatedData } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type UserList = PaginatedData<UserListItem> & {
  users: UserListItem[];
};

export function useUsers(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<UserList>(
    `/admin/users${query}`,
    fetcher
  );
}

export function useUser(id: string | null) {
  return useSWR<UserListItem>(
    id ? `/admin/users/${id}` : null,
    fetcher
  );
}

export function useUpdateUser(id: string) {
  return useSWRMutation(
    `/admin/users/${id}`,
    async (key: string, { arg }: { arg: Record<string, unknown> }) => {
      const res = await apiClient.patch(key, arg);
      return res.data;
    }
  );
}
