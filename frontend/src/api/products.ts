import client from "./client";
import type { ApiResponse, PaginatedProducts, Product, ProductFormData } from "../types";

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  is_active?: string;
}

export async function listProducts(filters: ProductFilters = {}): Promise<PaginatedProducts> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
  );
  const { data } = await client.get<ApiResponse<PaginatedProducts>>("/api/products/", { params });
  return data.data!;
}

export async function getProduct(id: string): Promise<Product> {
  const { data } = await client.get<ApiResponse<Product>>(`/api/products/${id}/`);
  return data.data!;
}

export async function createProduct(payload: ProductFormData): Promise<Product> {
  const { data } = await client.post<ApiResponse<Product>>("/api/products/", payload);
  return data.data!;
}

export async function updateProduct(
  id: string,
  payload: Partial<ProductFormData>
): Promise<Product> {
  const { data } = await client.patch<ApiResponse<Product>>(`/api/products/${id}/`, payload);
  return data.data!;
}

export async function deleteProduct(id: string): Promise<void> {
  await client.delete(`/api/products/${id}/`);
}
