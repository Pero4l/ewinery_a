"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useUpdateOrderStatus, useCancelOrder } from "@/hooks/use-orders";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ORDER_STATUS_TRANSITIONS, ORDER_STATUS_LABELS } from "@/lib/constants";
import { toast } from "sonner";

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  onSuccess: () => void;
}

export function OrderStatusActions({
  orderId,
  currentStatus,
  onSuccess,
}: OrderStatusActionsProps) {
  const [nextStatus, setNextStatus] = useState<string>("");
  const [note, setNote] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const { trigger: updateStatus, isMutating: isUpdating } =
    useUpdateOrderStatus(orderId);
  const { trigger: cancelOrder, isMutating: isCancelling } =
    useCancelOrder(orderId);

  const validTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];

  if (validTransitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This order is in a terminal state.
      </p>
    );
  }

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    try {
      await updateStatus({
        status: nextStatus as Parameters<typeof updateStatus>[0]["status"],
        note: note || undefined,
      });
      toast.success(`Order status updated to ${ORDER_STATUS_LABELS[nextStatus]}`);
      setNextStatus("");
      setNote("");
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder();
      toast.success("Order cancelled and stock restored");
      setShowCancelConfirm(false);
      onSuccess();
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Update Status</Label>
        <Select value={nextStatus} onValueChange={setNextStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select next status" />
          </SelectTrigger>
          <SelectContent>
            {validTransitions.map((status) => (
              <SelectItem key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Note (optional)</Label>
        <Textarea
          placeholder="Add a note about this status change..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>
      <div className="flex gap-3">
        <Button
          onClick={handleUpdateStatus}
          disabled={!nextStatus || isUpdating}
        >
          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Status
        </Button>
        {validTransitions.includes("CANCELLED") && (
          <Button
            variant="destructive"
            onClick={() => setShowCancelConfirm(true)}
            disabled={isCancelling}
          >
            Cancel Order
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? Stock will be restored."
        confirmLabel="Cancel Order"
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
}