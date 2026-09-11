"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Pencil, Trash2, Eye } from "lucide-react";
import { useCoupons, useDeleteCoupon } from "@/hooks/use-coupons";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Coupon } from "@/types";
import { CouponFormDialog } from "./coupon-form-dialog";

export function CouponsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };
  if (search) params.search = search;
  if (isActiveFilter) params.isActive = isActiveFilter;

  const { data, isLoading, mutate } = useCoupons(params);
  const { trigger: deleteCoupon } = useDeleteCoupon();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCoupon(deleteId);
      toast.success("Coupon deleted");
      mutate();
    } catch {
      toast.error("Failed to delete coupon");
    }
    setDeleteId(null);
  };

  if (isLoading) return <LoadingPage />;

  const coupons = data?.coupons || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by name or code..."
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          />
        </div>
        <Select value={isActiveFilter} onValueChange={(v) => { setIsActiveFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          title="No coupons found"
          description="No coupons match your filters. Create a coupon to get started."
        />
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Valid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.name}</TableCell>
                    <TableCell>{formatCurrency(coupon.amount)}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(coupon.startsAt)} – {formatDate(coupon.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          coupon.isActive
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>{coupon.usedCount ?? 0}</TableCell>
                    <TableCell>{coupon.assignedCount ?? 0}</TableCell>
                    <TableCell>{formatDate(coupon.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link href={`/coupons/${coupon.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditCoupon(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(coupon.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

      {editCoupon && (
        <CouponFormDialog
          coupon={editCoupon}
          open={true}
          onOpenChange={(open) => !open && setEditCoupon(null)}
          onSuccess={() => {
            setEditCoupon(null);
            mutate();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? Order history will keep its coupon code snapshot."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}