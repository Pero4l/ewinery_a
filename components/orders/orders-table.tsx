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
import { Eye } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { SearchInput } from "@/components/shared/search-input";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";

export function OrdersTable() {
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

  const { data, isLoading } = useOrders(params);

  if (isLoading) return <LoadingPage />;

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by order number..."
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders found" description="No orders match your filters." />
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.user?.fullName || "-"}</TableCell>
                    <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
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