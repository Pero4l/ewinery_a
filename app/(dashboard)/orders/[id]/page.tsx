"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useOrder } from "@/hooks/use-orders";
import { LoadingPage } from "@/components/shared/loading-page";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderStatusActions } from "@/components/orders/order-status-actions";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading, mutate } = useOrder(id);

  if (isLoading) return <LoadingPage />;
  if (!order) return <div className="text-center py-12">Order not found</div>;

  const address = order.shippingAddress || order.address || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>
                    Delivery Fee
                    {order.deliveryZoneName && (
                      <span className="text-muted-foreground"> · {order.deliveryZoneName}</span>
                    )}
                  </span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                {typeof order.discount === "number" && order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.customerNote && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.customerNote}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              <OrderStatusTimeline
                history={order.statusHistory || []}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusActions
                orderId={order.id}
                currentStatus={order.status}
                onSuccess={() => mutate()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Customer
                {order.isGuest && (
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Guest
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {order.user ? (
                <>
                  <p className="font-medium">{order.user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="text-sm text-muted-foreground">{order.user.phone}</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-medium">{address?.recipientName || "Guest customer"}</p>
                  {(order.guestEmail || address?.email) && (
                    <p className="text-sm text-muted-foreground">
                      <a className="hover:underline" href={`mailto:${order.guestEmail || address?.email}`}>
                        {order.guestEmail || address?.email}
                      </a>
                    </p>
                  )}
                  {address?.phone && (
                    <p className="text-sm text-muted-foreground">
                      <a className="hover:underline" href={`tel:${address.phone}`}>{address.phone}</a>
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {address && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="font-medium">{address.recipientName}</p>
                {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
                <p>{address.street}</p>
                <p>
                  {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
                </p>
                {address.country && <p>{address.country}</p>}
                {address.deliveryInstructions && (
                  <p className="pt-2 text-muted-foreground">
                    <span className="font-medium text-foreground">Instructions: </span>
                    {address.deliveryInstructions}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {(order.termsVersion || order.ageConfirmedAt) && (
            <Card>
              <CardHeader>
                <CardTitle>Legal Consent</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {order.termsVersion && (
                  <p>
                    Terms <span className="font-mono">{order.termsVersion}</span>
                    {order.termsAcceptedAt && (
                      <span className="text-muted-foreground"> · accepted {formatDateTime(order.termsAcceptedAt)}</span>
                    )}
                  </p>
                )}
                {order.ageConfirmedAt && (
                  <p>
                    Legal drinking age confirmed
                    <span className="text-muted-foreground"> · {formatDateTime(order.ageConfirmedAt)}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}