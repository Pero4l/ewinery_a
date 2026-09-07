export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity: number;
  isAvailable: boolean;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  volumeMl?: number;
  alcoholPercentage?: number;
  brand?: string;
  country?: string;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  volumeMl?: number;
  alcoholPercentage?: number;
  brand?: string;
  country?: string;
  categoryId: string;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface UpdateStockDto {
  quantity: number;
  isAvailable: boolean;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

import { Category } from "./category";
