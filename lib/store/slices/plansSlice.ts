import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

// Types
export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  trialDays: number;
  maxProducts: number;
  maxCategories: number;
  maxSubcategoriesPerCategory: number;
  maxOrders: number;
  customDomain: boolean;
  isActive: boolean;
}

interface SelectPlanResponse {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  requiresPayment: boolean;
}

interface PaymentInitResponse {
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  planName: string;
  gatewayUrl?: string;
  sessionData?: Record<string, unknown>;
}

interface PlansState {
  plans: Plan[];
  isLoading: boolean;
  isSelecting: boolean;
  selectedPlanId: string | null;
  paymentData: PaymentInitResponse | null;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  isLoading: false,
  isSelecting: false,
  selectedPlanId: null,
  paymentData: null,
  error: null,
};

// Fetch all active plans (public)
export const fetchPlans = createAsyncThunk<
  Plan[],
  void,
  { rejectValue: string }
>("plans/fetchPlans", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/plans");
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

// Activate free trial
export const activateTrial = createAsyncThunk<
  { message: string },
  void,
  { rejectValue: string }
>("plans/activateTrial", async (_, { rejectWithValue }) => {
  try {
    const response = await api.post("/subscriptions/activate-trial");
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to activate trial"
    );
  }
});

// Select a plan (returns payment info if paid plan)
export const selectPlan = createAsyncThunk<
  SelectPlanResponse,
  string,
  { rejectValue: string }
>("plans/selectPlan", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.post("/subscriptions/select-plan", { planId });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to select plan"
    );
  }
});

// Initiate payment for a plan
export const initiatePayment = createAsyncThunk<
  PaymentInitResponse,
  string,
  { rejectValue: string }
>("plans/initiatePayment", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.post("/payments/initiate", { planId });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to initiate payment"
    );
  }
});

const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPaymentData: (state) => {
      state.paymentData = null;
    },
    setSelectedPlanId: (state, action) => {
      state.selectedPlanId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        state.error = null;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch plans";
      })
      // Activate Trial
      .addCase(activateTrial.pending, (state) => {
        state.isSelecting = true;
        state.error = null;
      })
      .addCase(activateTrial.fulfilled, (state) => {
        state.isSelecting = false;
        state.error = null;
      })
      .addCase(activateTrial.rejected, (state, action) => {
        state.isSelecting = false;
        state.error = action.payload || "Failed to activate trial";
      })
      // Select Plan
      .addCase(selectPlan.pending, (state) => {
        state.isSelecting = true;
        state.error = null;
      })
      .addCase(selectPlan.fulfilled, (state) => {
        state.isSelecting = false;
        state.error = null;
      })
      .addCase(selectPlan.rejected, (state, action) => {
        state.isSelecting = false;
        state.error = action.payload || "Failed to select plan";
      })
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.isSelecting = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.isSelecting = false;
        state.paymentData = action.payload;
        state.error = null;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isSelecting = false;
        state.error = action.payload || "Failed to initiate payment";
      });
  },
});

export const { clearError, clearPaymentData, setSelectedPlanId } =
  plansSlice.actions;
export default plansSlice.reducer;
