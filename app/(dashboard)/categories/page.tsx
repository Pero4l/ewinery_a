"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CategoriesTable } from "@/components/categories/categories-table";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";

export default function CategoriesPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Manage product categories"
        action={{
          label: "Add Category",
          href: "#",
          icon: undefined,
        }}
      />
      <div className="mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md bg-[#722f37] px-4 py-2 text-sm font-medium text-white hover:bg-[#5c252c] transition-colors"
        >
          + Add Category
        </button>
      </div>
      <CategoriesTable />
      <CategoryFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => setShowCreate(false)}
      />
    </div>
  );
}
