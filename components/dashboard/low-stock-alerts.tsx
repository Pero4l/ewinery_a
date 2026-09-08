"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLowStockProducts } from "@/hooks/use-dashboard";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { asArray } from "@/lib/utils";
import type { LowStockProduct } from "@/types";

export function LowStockAlerts() {
  const { data: products, isLoading } = useLowStockProducts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Low Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const items = asArray<LowStockProduct>(products);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Low Stock Alerts</CardTitle>
        {items.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {items.length}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            All products are well-stocked
          </p>
        ) : (
          <div className="space-y-3">
            {items.slice(0, 8).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    {product.sku && (
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    product.stockQuantity === 0
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-orange-100 text-orange-800 border-orange-200"
                  }
                >
                  {product.stockQuantity} left
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}