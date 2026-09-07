"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star, Check, EyeOff, Clock } from "lucide-react";
import { useReviews } from "@/hooks/use-reviews";
import apiClient from "@/lib/api-client";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { REVIEW_STATUS_LABELS, REVIEW_STATUS_COLORS } from "@/lib/constants";
import { toast } from "sonner";

export function ReviewsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading, mutate } = useReviews(params);

  const handleModerate = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/reviews/${id}/moderate`, { status });
      toast.success(`Review ${status.toLowerCase()}`);
      mutate();
    } catch {
      toast.error("Failed to moderate review");
    }
  };

  if (isLoading) return <LoadingPage />;

  const reviews = data?.reviews || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search reviews..."
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="HIDDEN">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reviews.length === 0 ? (
        <EmptyState title="No reviews found" description="No reviews match your filters." />
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[140px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.user?.fullName || "-"}</TableCell>
                    <TableCell className="font-medium">
                      {review.productName || review.productId?.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {review.title || "-"}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_STATUS_COLORS[review.status] || ""}`}>
                        {REVIEW_STATUS_LABELS[review.status]}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {review.status !== "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-green-600"
                            title="Approve"
                            onClick={() => handleModerate(review.id, "APPROVED")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {review.status !== "HIDDEN" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-orange-600"
                            title="Hide"
                            onClick={() => handleModerate(review.id, "HIDDEN")}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                        {review.status !== "PENDING" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-yellow-600"
                            title="Set Pending"
                            onClick={() => handleModerate(review.id, "PENDING")}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </>
      )}
    </div>
  );
}
