"use client";

import { PageHeader } from "@/components/shared/page-header";
import { TicketsTable } from "@/components/support/tickets-table";

export default function SupportPage() {
  return (
    <div>
      <PageHeader
        title="Support Tickets"
        description="Manage customer support tickets"
      />
      <TicketsTable />
    </div>
  );
}
