"use client";

import { PageHeader } from "@/components/shared/page-header";
import { UsersTable } from "@/components/users/users-table";

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage all registered users"
      />
      <UsersTable />
    </div>
  );
}
