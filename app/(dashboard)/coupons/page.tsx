"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { CouponsTable } from "@/components/coupons/coupons-table";
import { CouponFormDialog } from "@/components/coupons/coupon-form-dialog";

export default function CouponsPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <PageHeader
        title="Coupons"
        description="Create and manage promo coupons"
        action={{
          label: "Create Coupon",
          href: "#",
          icon: undefined,
        }}
      />
      <div className="mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center justify-center rounded-md bg-[#722f37] px-4 py-2 text-sm font-medium text-white hover:bg-[#5c252c] transition-colors"
        >
          + Create Coupon
        </button>
      </div>
      <CouponsTable />
      <CouponFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onSuccess={() => setShowCreate(false)}
      />
    </div>
  );
}