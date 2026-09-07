"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ProductsTable } from "@/components/products/products-table";

export default function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={{
          label: "Add Product",
          href: "/products/new",
        }}
      />
      <ProductsTable />
    </div>
  );
}
