"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import type { Product } from "@/types";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  compareAtPrice: z.number().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().min(0),
  volumeMl: z.number().optional(),
  alcoholPercentage: z.number().optional(),
  brand: z.string().optional(),
  country: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isAvailable: z.boolean(),
});

type Form = z.infer<typeof schema>;

interface ProductFormProps {
  product?: Product;
  mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const { trigger: createProduct, isMutating: isCreating } = useCreateProduct();
  const { trigger: updateProduct, isMutating: isUpdating } = useUpdateProduct(
    product?.id || ""
  );
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories || [];
  const isMutating = isCreating || isUpdating;
  const [images, setImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      compareAtPrice: product?.compareAtPrice || undefined,
      sku: product?.sku || "",
      stockQuantity: product?.stockQuantity || 0,
      volumeMl: product?.volumeMl || undefined,
      alcoholPercentage: product?.alcoholPercentage || undefined,
      brand: product?.brand || "",
      country: product?.country || "",
      categoryId: product?.categoryId || "",
      status: product?.status || "DRAFT",
      isAvailable: product?.isAvailable ?? true,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || undefined,
        sku: product.sku || "",
        stockQuantity: product.stockQuantity || 0,
        volumeMl: product.volumeMl || undefined,
        alcoholPercentage: product.alcoholPercentage || undefined,
        brand: product.brand || "",
        country: product.country || "",
        categoryId: product.categoryId || "",
        status: product.status || "DRAFT",
        isAvailable: product.isAvailable ?? true,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: Form) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });
      images.forEach((img) => formData.append("images", img));

      if (mode === "edit" && product) {
        await updateProduct(formData);
        toast.success("Product updated");
      } else {
        await createProduct(formData);
        toast.success("Product created");
      }
      router.push("/products");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "edit" ? "Edit Product" : "Create Product"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" {...register("sku")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} rows={4} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" {...register("brand")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register("country")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="compareAtPrice">Compare At Price (₦)</Label>
                <Input id="compareAtPrice" type="number" step="0.01" {...register("compareAtPrice", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity</Label>
                <Input id="stockQuantity" type="number" {...register("stockQuantity", { valueAsNumber: true })} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="volumeMl">Volume (ml)</Label>
                <Input id="volumeMl" type="number" {...register("volumeMl", { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alcoholPercentage">Alcohol %</Label>
                <Input id="alcoholPercentage" type="number" step="0.1" {...register("alcoholPercentage", { valueAsNumber: true })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={watch("categoryId")} onValueChange={(v) => setValue("categoryId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={watch("status")} onValueChange={(v) => setValue("status", v as "DRAFT" | "ACTIVE" | "ARCHIVED")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Images</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setImages(files);
                }}
              />
              <p className="text-xs text-muted-foreground">
                {images.length > 0
                  ? `${images.length} file(s) selected`
                  : "Upload product images"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isMutating}>
            {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "edit" ? "Update Product" : "Create Product"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/products">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
