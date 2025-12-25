// Product Types

export interface ProductImage {
  id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  tenantId?: string;
  isActive?: boolean;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category?: Category;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  categoryId: number;
  subCategoryId: number | null;
  brand: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  category: Category;
  subCategory: SubCategory | null;
}

export interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  categories: Category[];
  subCategories: SubCategory[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  categoryId: number;
  subCategoryId?: number;
  brand?: string;
  images?: File[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}
