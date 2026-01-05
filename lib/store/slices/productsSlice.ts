import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Product,
  ProductsState,
  Category,
  SubCategory,
  CreateProductData,
  UpdateProductData,
} from "@/lib/types/products";

const initialState: ProductsState = {
  products: [],
  selectedProduct: null,
  categories: [],
  subCategories: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Fetch all products
export const fetchProducts = createAsyncThunk<
  Product[],
  { categoryId?: number; subCategoryId?: number } | void,
  { rejectValue: string }
>("products/fetchProducts", async (filters, { rejectWithValue }) => {
  try {
    let url = "/products/all";
    const params = new URLSearchParams();

    if (filters?.categoryId) {
      params.append("category", filters.categoryId.toString());
    }
    if (filters?.subCategoryId) {
      params.append("subCategory", filters.subCategoryId.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get(url);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch products"
    );
  }
});

// Fetch single product
export const fetchProduct = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>("products/fetchProduct", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch product"
    );
  }
});

// Create product
export const createProduct = createAsyncThunk<
  Product,
  CreateProductData,
  { rejectValue: string }
>("products/createProduct", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("price", data.price.toString());
    formData.append("categoryId", data.categoryId.toString());

    if (data.subCategoryId) {
      formData.append("subCategoryId", data.subCategoryId.toString());
    }
    if (data.brand) {
      formData.append("brand", data.brand);
    }
    if (data.images) {
      data.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await api.post("/products/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create product"
    );
  }
});

// Update product
export const updateProduct = createAsyncThunk<
  Product,
  UpdateProductData,
  { rejectValue: string }
>("products/updateProduct", async (data, { rejectWithValue }) => {
  try {
    const formData = new FormData();

    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.price) formData.append("price", data.price.toString());
    if (data.categoryId)
      formData.append("categoryId", data.categoryId.toString());
    if (data.subCategoryId)
      formData.append("subCategoryId", data.subCategoryId.toString());
    if (data.brand) formData.append("brand", data.brand);
    if (data.images) {
      data.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await api.patch(`/products/${data.id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to update product"
    );
  }
});

// Delete product
export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("products/deleteProduct", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete product"
    );
  }
});

// Fetch categories
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("products/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/categories/all");
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch categories"
    );
  }
});

// Fetch subcategories
export const fetchSubCategories = createAsyncThunk<
  SubCategory[],
  number | void,
  { rejectValue: string }
>("products/fetchSubCategories", async (categoryId, { rejectWithValue }) => {
  try {
    let url = "/subcategories/all";
    if (categoryId) {
      url += `?categoryId=${categoryId}`;
    }
    const response = await api.get(url);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch subcategories"
    );
  }
});

// Create category
export const createCategory = createAsyncThunk<
  Category,
  string,
  { rejectValue: string }
>("products/createCategory", async (name, { rejectWithValue }) => {
  try {
    const response = await api.post("/categories/create", { name });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create category"
    );
  }
});

// Update category
export const updateCategory = createAsyncThunk<
  Category,
  { id: number; name: string },
  { rejectValue: string }
>("products/updateCategory", async ({ id, name }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/categories/update/${id}`, { name });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to update category"
    );
  }
});

// Delete category
export const deleteCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("products/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/categories/delete/${id}`);
    return id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete category"
    );
  }
});

// Create subcategory
export const createSubCategory = createAsyncThunk<
  SubCategory,
  { name: string; categoryId: number },
  { rejectValue: string }
>("products/createSubCategory", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/subcategories/create", data);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create subcategory"
    );
  }
});

// Update subcategory
export const updateSubCategory = createAsyncThunk<
  SubCategory,
  { id: number; name: string; categoryId: number },
  { rejectValue: string }
>(
  "products/updateSubCategory",
  async ({ id, name, categoryId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/subcategories/update/${id}`, {
        name,
        categoryId,
      });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update subcategory"
      );
    }
  }
);

// Delete subcategory
export const deleteSubCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("products/deleteSubCategory", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/subcategories/delete/${id}`);
    return id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete subcategory"
    );
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch products";
      })

      // Fetch Single Product
      .addCase(fetchProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch product";
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to create product";
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.products.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        state.selectedProduct = action.payload;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to update product";
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to delete product";
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch categories";
      })

      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isSubmitting = true;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to create category";
      })

      // Update Category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })

      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      })

      // Fetch Subcategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch subcategories";
      })

      // Create Subcategory
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.subCategories.push(action.payload);
      })

      // Update Subcategory
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        const index = state.subCategories.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.subCategories[index] = action.payload;
        }
      })

      // Delete Subcategory
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.subCategories = state.subCategories.filter(
          (s) => s.id !== action.payload
        );
      });
  },
});

export const { clearError, clearSelectedProduct, setSelectedProduct } =
  productsSlice.actions;
export default productsSlice.reducer;
