// Category Types

export interface Category {
  id: number;
  name: string;
  slug: string;
  tenantId?: string;
  isActive?: boolean;
  productsCount?: number;
  subCategoriesCount?: number;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category?: Category;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesState {
  categories: Category[];
  subCategories: SubCategory[];
  selectedCategory: Category | null;
  selectedSubCategory: SubCategory | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  id: number;
  name: string;
}

export interface CreateSubCategoryData {
  name: string;
  categoryId: number;
}

export interface UpdateSubCategoryData {
  id: number;
  name: string;
  categoryId: number;
}
