import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Plan,
  PlansState,
  CreatePlanData,
  UpdatePlanData,
} from "@/lib/types/plans";

const initialState: PlansState = {
  plans: [],
  selectedPlan: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Fetch all plans (admin - includes inactive)
export const fetchAllPlansAdmin = createAsyncThunk<
  Plan[],
  void,
  { rejectValue: string }
>("adminPlans/fetchAllPlansAdmin", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/plans/admin/all");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch plans"
    );
  }
});

// Fetch single plan
export const fetchPlanById = createAsyncThunk<
  Plan,
  string,
  { rejectValue: string }
>("adminPlans/fetchPlanById", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/plans/${planId}`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch plan"
    );
  }
});

// Create plan (SUPER_ADMIN only)
export const createPlan = createAsyncThunk<
  Plan,
  CreatePlanData,
  { rejectValue: string }
>("adminPlans/createPlan", async (planData, { rejectWithValue }) => {
  try {
    const response = await api.post("/plans", planData);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create plan"
    );
  }
});

// Update plan (SUPER_ADMIN only)
export const updatePlan = createAsyncThunk<
  Plan,
  UpdatePlanData,
  { rejectValue: string }
>("adminPlans/updatePlan", async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/plans/${id}`, data);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to update plan"
    );
  }
});

// Seed default plans (SUPER_ADMIN only)
export const seedPlans = createAsyncThunk<
  { message: string; plans: Plan[] },
  void,
  { rejectValue: string }
>("adminPlans/seedPlans", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/plans/seed");
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to seed plans"
    );
  }
});

// Delete plan (SUPER_ADMIN only)
export const deletePlan = createAsyncThunk<
  Plan,
  string,
  { rejectValue: string }
>("adminPlans/deletePlan", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/plans/${planId}`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete plan"
    );
  }
});

const adminPlansSlice = createSlice({
  name: "adminPlans",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Plans Admin
      .addCase(fetchAllPlansAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPlansAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        state.error = null;
      })
      .addCase(fetchAllPlansAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch plans";
      })
      // Fetch Plan By ID
      .addCase(fetchPlanById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlanById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPlan = action.payload;
        state.error = null;
      })
      .addCase(fetchPlanById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch plan";
      })
      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.plans.push(action.payload);
        state.error = null;
      })
      .addCase(createPlan.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to create plan";
      })
      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.plans.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.plans[index] = action.payload;
        }
        state.selectedPlan = null;
        state.error = null;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to update plan";
      })
      // Seed Plans
      .addCase(seedPlans.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(seedPlans.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.plans = action.payload.plans;
        state.error = null;
      })
      .addCase(seedPlans.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to seed plans";
      })
      // Delete Plan
      .addCase(deletePlan.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.plans = state.plans.filter((p) => p.id !== action.payload.id);
        state.error = null;
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to delete plan";
      });
  },
});

export const { clearError, setSelectedPlan, clearSelectedPlan } =
  adminPlansSlice.actions;
export default adminPlansSlice.reducer;
