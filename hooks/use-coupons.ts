import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type {
  Coupon,
  PaginatedData,
  CreateCouponDto,
  UpdateCouponDto,
  CouponAssignment,
  AssignCouponDto,
} from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type CouponList = PaginatedData<Coupon> & {
  coupons: Coupon[];
};

export function useCoupons(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<CouponList>(`/admin/coupons${query}`, fetcher);
}

export function useCoupon(id: string | null) {
  return useSWR<Coupon>(
    id ? `/admin/coupons/${id}` : null,
    fetcher
  );
}

export function useCreateCoupon() {
  return useSWRMutation(
    "/admin/coupons",
    async (_key: string, { arg }: { arg: CreateCouponDto }) => {
      const res = await apiClient.post("/admin/coupons", arg);
      return res.data;
    }
  );
}

export function useUpdateCoupon(id: string) {
  return useSWRMutation(
    `/admin/coupons/${id}`,
    async (key: string, { arg }: { arg: UpdateCouponDto }) => {
      const res = await apiClient.patch(key, arg);
      return res.data;
    }
  );
}

export function useDeleteCoupon() {
  return useSWRMutation(
    "/admin/coupons",
    async (_key: string, { arg }: { arg: string }) => {
      const res = await apiClient.delete(`/admin/coupons/${arg}`);
      return res.data;
    }
  );
}

export function useAssignCoupon(id: string) {
  return useSWRMutation(
    `/admin/coupons/${id}/assign`,
    async (_key: string, { arg }: { arg: AssignCouponDto }) => {
      const res = await apiClient.post(`/admin/coupons/${id}/assign`, arg);
      return res.data;
    }
  );
}

export function useRevokeCoupon(id: string) {
  return useSWRMutation(
    `/admin/coupons/${id}/revoke`,
    async (_key: string, { arg }: { arg: AssignCouponDto }) => {
      const res = await apiClient.post(`/admin/coupons/${id}/revoke`, arg);
      return res.data;
    }
  );
}

export type CouponAssignmentList = PaginatedData<CouponAssignment> & {
  assignments: CouponAssignment[];
};

export function useCouponAssignments(
  id: string | null,
  params?: Record<string, string>
) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<CouponAssignmentList>(
    id ? `/admin/coupons/${id}/assignments${query}` : null,
    fetcher
  );
}