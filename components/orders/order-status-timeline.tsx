"use client";

import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus, OrderStatusHistory } from "@/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

interface OrderStatusTimelineProps {
  history: OrderStatusHistory[];
  currentStatus: string;
}

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "READY_FOR_DELIVERY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
];

export function OrderStatusTimeline({ history, currentStatus }: OrderStatusTimelineProps) {
  const isCancelled = currentStatus === "CANCELLED";
  const historyStatuses = history.map((h) => h.status);

  return (
    <div className="space-y-3">
      {isCancelled ? (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <X className="h-5 w-5 text-red-600 shrink-0" />
          <div>
            <p className="font-medium text-red-800">Order Cancelled</p>
            {history.length > 0 && (
              <p className="text-xs text-red-600 mt-0.5">
                {formatDateTime(history[history.length - 1].createdAt)}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {ALL_STATUSES.map((status) => {
            const isCompleted = historyStatuses.includes(status);
            const isCurrent = status === currentStatus;

            return (
              <div key={status} className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2",
                    isCompleted
                      ? "bg-green-500 border-green-500"
                      : isCurrent
                      ? "bg-[#722f37] border-[#722f37]"
                      : "bg-white border-gray-300"
                  )}
                >
                  {isCompleted && <Check className="h-3.5 w-3.5 text-white" />}
                  {isCurrent && !isCompleted && (
                    <Clock className="h-3.5 w-3.5 text-white" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm",
                    isCurrent
                      ? "font-semibold text-[#722f37]"
                      : isCompleted
                      ? "text-green-700"
                      : "text-gray-400"
                  )}
                >
                  {ORDER_STATUS_LABELS[status]}
                </span>
                {isCompleted && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDateTime(
                      history.find((h) => h.status === status)?.createdAt || ""
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}