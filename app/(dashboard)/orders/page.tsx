"use client";

import { PageHeader } from "@/components/shared/page-header";
import { OrdersTable } from "@/components/orders/orders-table";

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Orders"
        description="Manage customer orders"
      />
      <OrdersTable />
    </div>
  );
}