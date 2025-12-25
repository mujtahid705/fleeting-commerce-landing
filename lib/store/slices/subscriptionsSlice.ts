import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Subscription,
  UsageData,
  AccessStatus,
  SubscriptionsState,
} from "@/lib/types/subscriptions";

const initialState: SubscriptionsState = {
  currentSubscription: null,
  usage: null,
  accessStatus: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Fetch current subscription
export const fetchCurrentSubscription = createAsyncThunk<
  Subscription,
  void,
  { rejectValue: string }
>("subscriptions/fetchCurrent", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/subscriptions/current");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch subscription"
    );
  }
});

// Fetch usage data
export const fetchUsage = createAsyncThunk<
  UsageData,
  void,
  { rejectValue: string }
>("subscriptions/fetchUsage", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/subscriptions/usage");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch usage"
    );
  }
});

// Fetch access status
export const fetchAccessStatus = createAsyncThunk<
  AccessStatus,
  void,
  { rejectValue: string }
>("subscriptions/fetchAccessStatus", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/subscriptions/access-status");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch access status"
    );
  }
});

// Activate trial
export const activateTrial = createAsyncThunk<
  Subscription,
  void,
  { rejectValue: string }
>("subscriptions/activateTrial", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/subscriptions/activate-trial");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to activate trial"
    );
  }
});

// Upgrade subscription
export const upgradeSubscription = createAsyncThunk<
  { message: string; requiresPayment: boolean; planName: string },
  string,
  { rejectValue: string }
>("subscriptions/upgrade", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.post("/subscriptions/upgrade", { planId });
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to upgrade subscription"
    );
  }
});

// Downgrade subscription
export const downgradeSubscription = createAsyncThunk<
  { message: string; effectiveDate: string; newPlanName: string },
  string,
  { rejectValue: string }
>("subscriptions/downgrade", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.post("/subscriptions/downgrade", { planId });
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to downgrade subscription"
    );
  }
});

// Renew subscription
export const renewSubscription = createAsyncThunk<
  { message: string; requiresPayment: boolean },
  void,
  { rejectValue: string }
>("subscriptions/renew", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/subscriptions/renew");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to renew subscription"
    );
  }
});

const subscriptionsSlice = createSlice({
  name: "subscriptions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSubscriptionState: (state) => {
      state.currentSubscription = null;
      state.usage = null;
      state.accessStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current Subscription
      .addCase(fetchCurrentSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSubscription = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch subscription";
      })
      // Fetch Usage
      .addCase(fetchUsage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usage = action.payload;
        state.error = null;
      })
      .addCase(fetchUsage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch usage";
      })
      // Fetch Access Status
      .addCase(fetchAccessStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccessStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessStatus = action.payload;
        state.error = null;
      })
      .addCase(fetchAccessStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch access status";
      })
      // Activate Trial
      .addCase(activateTrial.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(activateTrial.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentSubscription = action.payload;
        state.error = null;
      })
      .addCase(activateTrial.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to activate trial";
      })
      // Upgrade Subscription
      .addCase(upgradeSubscription.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(upgradeSubscription.fulfilled, (state) => {
        state.isSubmitting = false;
        state.error = null;
      })
      .addCase(upgradeSubscription.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to upgrade subscription";
      })
      // Downgrade Subscription
      .addCase(downgradeSubscription.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(downgradeSubscription.fulfilled, (state) => {
        state.isSubmitting = false;
        state.error = null;
      })
      .addCase(downgradeSubscription.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to downgrade subscription";
      })
      // Renew Subscription
      .addCase(renewSubscription.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(renewSubscription.fulfilled, (state) => {
        state.isSubmitting = false;
        state.error = null;
      })
      .addCase(renewSubscription.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to renew subscription";
      });
  },
});

export const { clearError, clearSubscriptionState } =
  subscriptionsSlice.actions;
export default subscriptionsSlice.reducer;
