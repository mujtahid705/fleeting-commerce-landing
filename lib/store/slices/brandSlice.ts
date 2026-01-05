import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  BrandState,
  TenantBrand,
  HeroSection,
  BrowseCategoriesSection,
  ExclusiveSection,
  FeaturedCategoriesSection,
  FooterSection,
} from "@/lib/types/brand";

const initialState: BrandState = {
  brand: null,
  loading: false,
  error: null,
  updateLoading: false,
  domainCheckLoading: false,
};

// Fetch current tenant's brand settings
export const fetchBrand = createAsyncThunk(
  "brand/fetchBrand",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/tenant-brand");
      return response.data.data as TenantBrand;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch brand settings"
      );
    }
  }
);

// Check domain uniqueness
export const checkDomainUniqueness = createAsyncThunk(
  "brand/checkDomainUniqueness",
  async (domain: string, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/tenant-brand/check-unique-domain?domain=${domain}`
      );
      return response.data as { isAvailable: boolean };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to check domain availability"
      );
    }
  }
);

// Create or update brand settings (upsert)
export const upsertBrand = createAsyncThunk(
  "brand/upsertBrand",
  async (
    data: {
      logo?: File;
      heroImage?: File;
      exclusiveImages?: File[];
      domain?: string;
      tagline?: string;
      description?: string;
      theme?: number;
      hero?: HeroSection;
      browseCategories?: BrowseCategoriesSection;
      exclusiveSection?: ExclusiveSection;
      featuredCategories?: FeaturedCategoriesSection;
      footer?: FooterSection;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      if (data.logo) formData.append("logo", data.logo);
      if (data.heroImage) formData.append("heroImage", data.heroImage);
      if (data.exclusiveImages) {
        data.exclusiveImages.forEach((file) => {
          formData.append("exclusiveImages", file);
        });
      }
      if (data.domain !== undefined) formData.append("domain", data.domain);
      if (data.tagline !== undefined) formData.append("tagline", data.tagline);
      if (data.description !== undefined)
        formData.append("description", data.description);
      if (data.theme !== undefined)
        formData.append("theme", data.theme.toString());
      if (data.hero) formData.append("hero", JSON.stringify(data.hero));
      if (data.browseCategories)
        formData.append(
          "browseCategories",
          JSON.stringify(data.browseCategories)
        );
      if (data.exclusiveSection)
        formData.append(
          "exclusiveSection",
          JSON.stringify(data.exclusiveSection)
        );
      if (data.featuredCategories)
        formData.append(
          "featuredCategories",
          JSON.stringify(data.featuredCategories)
        );
      if (data.footer) formData.append("footer", JSON.stringify(data.footer));

      const response = await api.post("/tenant-brand", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data as TenantBrand;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to save brand settings"
      );
    }
  }
);

// Update brand settings (partial update)
export const updateBrand = createAsyncThunk(
  "brand/updateBrand",
  async (
    data: {
      logo?: File;
      heroImage?: File;
      exclusiveImages?: File[];
      tagline?: string;
      description?: string;
      theme?: number;
      hero?: HeroSection;
      browseCategories?: BrowseCategoriesSection;
      exclusiveSection?: ExclusiveSection;
      featuredCategories?: FeaturedCategoriesSection;
      footer?: FooterSection;
    },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();
      if (data.logo) formData.append("logo", data.logo);
      if (data.heroImage) formData.append("heroImage", data.heroImage);
      if (data.exclusiveImages) {
        data.exclusiveImages.forEach((file) => {
          formData.append("exclusiveImages", file);
        });
      }
      if (data.tagline !== undefined) formData.append("tagline", data.tagline);
      if (data.description !== undefined)
        formData.append("description", data.description);
      if (data.theme !== undefined)
        formData.append("theme", data.theme.toString());
      if (data.hero) formData.append("hero", JSON.stringify(data.hero));
      if (data.browseCategories)
        formData.append(
          "browseCategories",
          JSON.stringify(data.browseCategories)
        );
      if (data.exclusiveSection)
        formData.append(
          "exclusiveSection",
          JSON.stringify(data.exclusiveSection)
        );
      if (data.featuredCategories)
        formData.append(
          "featuredCategories",
          JSON.stringify(data.featuredCategories)
        );
      if (data.footer) formData.append("footer", JSON.stringify(data.footer));

      const response = await api.patch("/tenant-brand", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data as TenantBrand;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update brand settings"
      );
    }
  }
);

// Delete logo only
export const deleteLogo = createAsyncThunk(
  "brand/deleteLogo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/tenant-brand/logo");
      return response.data.data as TenantBrand;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete logo"
      );
    }
  }
);

// Delete all brand settings
export const deleteBrand = createAsyncThunk(
  "brand/deleteBrand",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/tenant-brand");
      return null;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete brand settings"
      );
    }
  }
);

const brandSlice = createSlice({
  name: "brand",
  initialState,
  reducers: {
    clearBrandError: (state) => {
      state.error = null;
    },
    resetBrand: (state) => {
      state.brand = null;
      state.loading = false;
      state.error = null;
      state.updateLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Check domain uniqueness
    builder
      .addCase(checkDomainUniqueness.pending, (state) => {
        state.domainCheckLoading = true;
        state.error = null;
      })
      .addCase(checkDomainUniqueness.fulfilled, (state) => {
        state.domainCheckLoading = false;
      })
      .addCase(checkDomainUniqueness.rejected, (state, action) => {
        state.domainCheckLoading = false;
        state.error = action.payload as string;
      });

    // Fetch brand
    builder
      .addCase(fetchBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brand = action.payload;
      })
      .addCase(fetchBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Upsert brand
    builder
      .addCase(upsertBrand.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(upsertBrand.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.brand = action.payload;
      })
      .addCase(upsertBrand.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Update brand
    builder
      .addCase(updateBrand.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.brand = action.payload;
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Delete logo
    builder
      .addCase(deleteLogo.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(deleteLogo.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.brand = action.payload;
      })
      .addCase(deleteLogo.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // Delete brand
    builder
      .addCase(deleteBrand.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state) => {
        state.updateLoading = false;
        state.brand = null;
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBrandError, resetBrand } = brandSlice.actions;
export default brandSlice.reducer;
