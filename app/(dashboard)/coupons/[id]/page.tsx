"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Undo2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useCouponAssignments,
  useRevokeCoupon,
} from "@/hooks/use-coupons";
import { LoadingPage } from "@/components/shared/loading-page";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { COUPON_ASSIGNMENT_STATUS_LABELS, COUPON_ASSIGNMENT_STATUS_COLORS } from "@/lib/constants";
import { CouponFormDialog } from "@/components/coupons/coupon-form-dialog";
import { AssignCouponDialog } from "@/components/coupons/assign-coupon-dialog";
import { toast } from "sonner";

export default function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: coupon, isLoading, mutate } = useCoupon(id);
  const { trigger: updateCoupon, isMutating: isUpdating } = useUpdateCoupon(id);
  const { trigger: deleteCoupon, isMutating: isDeleting } = useDeleteCoupon();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showEdit, setShowEdit] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const assignmentParams: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };
  if (statusFilter) assignmentParams.status = statusFilter;

  const {
    data: assignmentData,
    isLoading: assignmentsLoading,
    mutate: mutateAssignments,
  } = useCouponAssignments(id, assignmentParams);
  const { trigger: revokeCoupon, isMutating: isRevoking } = useRevokeCoupon(id);

  const handleToggleActive = async () => {
    try {
      await updateCoupon({ isActive: !coupon!.isActive });
      toast.success(coupon!.isActive ? "Coupon deactivated" : "Coupon activated");
      mutate();
    } catch {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted");
      router.push("/coupons");
    } catch {
      toast.error("Failed to delete coupon");
      setConfirmDelete(false);
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await revokeCoupon({ userIds: [userId] });
      toast.success("Assignment revoked");
      mutateAssignments();
      mutate();
    } catch {
      toast.error("Failed to revoke assignment");
    }
  };

  if (isLoading) return <LoadingPage />;
  if (!coupon) return <div className="text-center py-12">Coupon not found</div>;

  const assignments = assignmentData?.assignments || [];
  const assignmentPagination = assignmentData?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/coupons">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{coupon.code}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                coupon.isActive
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {coupon.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowEdit(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleToggleActive} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {coupon.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => setConfirmDelete(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coupon Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{coupon.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{coupon.description || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="font-medium">{formatCurrency(coupon.amount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valid From</p>
                <p className="font-medium">{formatDateTime(coupon.startsAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expires</p>
                <p className="font-medium">{formatDateTime(coupon.expiresAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDateTime(coupon.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Assigned users</p>
                <p className="font-medium">{coupon.assignedCount ?? 0}</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Redeemed</p>
                <p className="font-medium">{coupon.usedCount ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Assigned Users</CardTitle>
                <Button size="sm" onClick={() => setShowAssign(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Users
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="UNREDEEMED">Unredeemed</SelectItem>
                  <SelectItem value="REDEEMED">Redeemed</SelectItem>
                </SelectContent>
              </Select>

              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : assignments.length === 0 ? (
                <EmptyState
                  title="No assignments"
                  description="No users have been assigned this coupon."
                />
              ) : (
                <>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">
                              {a.user?.fullName || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {a.user?.email || "-"}
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${COUPON_ASSIGNMENT_STATUS_COLORS[a.status] || ""}`}>
                                {a.status === "REDEEMED" && (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                )}
                                {COUPON_ASSIGNMENT_STATUS_LABELS[a.status]}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateTime(a.assignedAt || a.redeemedAt || "")}
                            </TableCell>
                            <TableCell>
                              {a.status === "UNREDEEMED" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-muted-foreground"
                                  onClick={() => handleRevoke(a.userId || a.user?.id || "")}
                                  disabled={!a.userId && !a.user?.id}
                                >
                                  {isRevoking ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Undo2 className="mr-1 h-3 w-3" />
                                  )}
                                  Revoke
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {formatDateTime(a.redeemedAt)}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <DataTablePagination
                    page={assignmentPagination.page}
                    pages={assignmentPagination.pages}
                    total={assignmentPagination.total}
                    limit={assignmentPagination.limit}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CouponFormDialog
        coupon={coupon}
        open={showEdit}
        onOpenChange={setShowEdit}
        onSuccess={() => {
          setShowEdit(false);
          mutate();
        }}
      />

      {showAssign && (
        <AssignCouponDialog
          couponId={id}
          open={showAssign}
          onOpenChange={setShowAssign}
          onSuccess={() => {
            setShowAssign(false);
            mutateAssignments();
            mutate();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(false)}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? Order history will keep its coupon code snapshot."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}