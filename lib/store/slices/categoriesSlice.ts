import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Category,
  SubCategory,
  CategoriesState,
  CreateCategoryData,
  UpdateCategoryData,
  CreateSubCategoryData,
  UpdateSubCategoryData,
} from "@/lib/types/categories";

const initialState: CategoriesState = {
  categories: [],
  subCategories: [],
  selectedCategory: null,
  selectedSubCategory: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Categories

export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchCategories", async (_, { rejectWithValue }) => {
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

export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryData,
  { rejectValue: string }
>("categories/createCategory", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/categories/create", data);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create category"
    );
  }
});

export const updateCategory = createAsyncThunk<
  Category,
  UpdateCategoryData,
  { rejectValue: string }
>("categories/updateCategory", async ({ id, name }, { rejectWithValue }) => {
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

export const deleteCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("categories/deleteCategory", async (id, { rejectWithValue }) => {
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

// Subcategories

export const fetchSubCategories = createAsyncThunk<
  SubCategory[],
  number | void,
  { rejectValue: string }
>("categories/fetchSubCategories", async (categoryId, { rejectWithValue }) => {
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

export const createSubCategory = createAsyncThunk<
  SubCategory,
  CreateSubCategoryData,
  { rejectValue: string }
>("categories/createSubCategory", async (data, { rejectWithValue }) => {
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

export const updateSubCategory = createAsyncThunk<
  SubCategory,
  UpdateSubCategoryData,
  { rejectValue: string }
>(
  "categories/updateSubCategory",
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

export const deleteSubCategory = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("categories/deleteSubCategory", async (id, { rejectWithValue }) => {
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

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    },
    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
    },
    clearSelectedSubCategory: (state) => {
      state.selectedSubCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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
        state.error = null;
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
      .addCase(updateCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to update category";
      })

      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.categories = state.categories.filter(
          (c) => c.id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to delete category";
      })

      // Fetch Subcategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
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
      .addCase(createSubCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createSubCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.subCategories.push(action.payload);
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to create subcategory";
      })

      // Update Subcategory
      .addCase(updateSubCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateSubCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.subCategories.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.subCategories[index] = action.payload;
        }
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to update subcategory";
      })

      // Delete Subcategory
      .addCase(deleteSubCategory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.subCategories = state.subCategories.filter(
          (s) => s.id !== action.payload
        );
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to delete subcategory";
      });
  },
});

export const {
  clearError,
  setSelectedCategory,
  clearSelectedCategory,
  setSelectedSubCategory,
  clearSelectedSubCategory,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
