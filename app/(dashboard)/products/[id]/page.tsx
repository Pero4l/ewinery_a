"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { LoadingPage } from "@/components/shared/loading-page";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_COLORS } from "@/lib/constants";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) return <LoadingPage />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              Created {formatDate(product.createdAt)}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/products/${product.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compare At</p>
                  <p className="text-lg font-bold">
                    {product.compareAtPrice
                      ? formatCurrency(product.compareAtPrice)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-medium">{product.stockQuantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      PRODUCT_STATUS_COLORS[product.status] || ""
                    }`}
                  >
                    {PRODUCT_STATUS_LABELS[product.status]}
                  </span>
                </div>
              </div>
              {product.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{product.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {product.brand || product.country || product.volumeMl || product.alcoholPercentage ? (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {product.brand && (
                    <div>
                      <p className="text-sm text-muted-foreground">Brand</p>
                      <p className="font-medium">{product.brand}</p>
                    </div>
                  )}
                  {product.country && (
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium">{product.country}</p>
                    </div>
                  )}
                  {product.volumeMl && (
                    <div>
                      <p className="text-sm text-muted-foreground">Volume</p>
                      <p className="font-medium">{product.volumeMl}ml</p>
                    </div>
                  )}
                  {product.alcoholPercentage != null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Alcohol</p>
                      <p className="font-medium">{product.alcoholPercentage}%</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((img, i) => (
                    <Image
                      key={img.id || i}
                      src={img.url}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="rounded-lg object-cover w-full aspect-square"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No images
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
