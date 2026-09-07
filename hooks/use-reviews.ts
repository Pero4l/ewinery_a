import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import apiClient from "@/lib/api-client";
import type { Review, PaginatedData, ModerateReviewDto } from "@/types";

const fetcher = (url: string) =>
  apiClient.get(url).then((res) => res.data.data);

export type ReviewList = PaginatedData<Review> & {
  reviews: Review[];
};

export function useReviews(params?: Record<string, string>) {
  const query = params ? "?" + new URLSearchParams(params).toString() : "";
  return useSWR<ReviewList>(
    `/admin/reviews${query}`,
    fetcher
  );
}

export function useModerateReview(id: string) {
  return useSWRMutation(
    `/admin/reviews/${id}/moderate`,
    async (key: string, { arg }: { arg: ModerateReviewDto }) => {
      const res = await apiClient.patch(key, arg);
      return res.data;
    }
  );
}
