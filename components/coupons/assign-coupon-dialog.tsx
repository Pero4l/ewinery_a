"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUsers } from "@/hooks/use-users";
import { useAssignCoupon } from "@/hooks/use-coupons";
import { SearchInput } from "@/components/shared/search-input";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { toast } from "sonner";

const MAX_ASSIGN = 100;

interface AssignCouponDialogProps {
  couponId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AssignCouponDialog({
  couponId,
  open,
  onOpenChange,
  onSuccess,
}: AssignCouponDialogProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
    role: "USER",
    isActive: "true",
  };
  if (search) params.search = search;

  const { data, isLoading } = useUsers(params);
  const { trigger: assignCoupon, isMutating } = useAssignCoupon(couponId);

  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_ASSIGN) {
          toast.error(`You can assign to at most ${MAX_ASSIGN} users`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const handleAssign = async () => {
    if (selected.size === 0) return;
    try {
      await assignCoupon({ userIds: Array.from(selected) });
      toast.success(`Coupon assigned to ${selected.size} user${selected.size === 1 ? "" : "s"}`);
      setSelected(new Set());
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to assign coupon");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Assign Coupon to Users</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <SearchInput
            placeholder="Search users..."
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
          />
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              {selected.size} selected
            </Label>
          </div>
          <ScrollArea className="h-[300px] border rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-10">
                No matching users
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer"
                      onClick={() => toggle(user.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selected.has(user.id)}
                          onChange={() => toggle(user.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
          <DataTablePagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
            onLimitChange={(l) => { setLimit(l); setPage(1); }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={selected.size === 0 || isMutating}>
            {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}