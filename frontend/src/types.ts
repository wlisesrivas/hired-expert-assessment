export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  stock: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  is_active: boolean;
}

export interface PaginatedProducts {
  results: Product[];
  count: number;
  page: number;
  total_pages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}
