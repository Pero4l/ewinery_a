"use client";

import { use } from "react";
import { ProductForm } from "@/components/products/product-form";
import { useProduct } from "@/hooks/use-products";
import { LoadingPage } from "@/components/shared/loading-page";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) return <LoadingPage />;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return <ProductForm product={product} mode="edit" />;
}
