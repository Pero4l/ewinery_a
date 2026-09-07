"use client";

import { PageHeader } from "@/components/shared/page-header";
import { ReviewsTable } from "@/components/reviews/reviews-table";

export default function ReviewsPage() {
  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews"
      />
      <ReviewsTable />
    </div>
  );
}
