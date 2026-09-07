"use client";

import { PageHeader } from "@/components/shared/page-header";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export default function TransactionsPage() {
  return (
    <div>
      <PageHeader
        title="Transactions"
        description="View all payment transactions"
      />
      <TransactionsTable />
    </div>
  );
}
