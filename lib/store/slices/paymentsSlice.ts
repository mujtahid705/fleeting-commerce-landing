import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Payment, PaymentsState, PaymentInitData } from "@/lib/types/payments";

const initialState: PaymentsState = {
  payments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,
};

// Fetch payment history
export const fetchPaymentHistory = createAsyncThunk<
  Payment[],
  void,
  { rejectValue: string }
>("payments/fetchHistory", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/payments/history");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch payment history"
    );
  }
});

// Fetch single payment
export const fetchPaymentById = createAsyncThunk<
  Payment,
  string,
  { rejectValue: string }
>("payments/fetchById", async (paymentId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch payment"
    );
  }
});

// Initiate payment
export const initiatePayment = createAsyncThunk<
  PaymentInitData,
  string,
  { rejectValue: string }
>("payments/initiate", async (planId, { rejectWithValue }) => {
  try {
    const response = await api.post("/payments/initiate", { planId });
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to initiate payment"
    );
  }
});

// Verify manual payment (SUPER_ADMIN only)
export const verifyManualPayment = createAsyncThunk<
  Payment,
  { paymentId: string; action: "approve" | "reject" },
  { rejectValue: string }
>(
  "payments/verifyManual",
  async ({ paymentId, action }, { rejectWithValue }) => {
    try {
      const response = await api.post("/payments/verify-manual", {
        paymentId,
        action,
      });
      return response.data.data || response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        err.response?.data?.message || "Failed to verify payment"
      );
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPayment: (state, action) => {
      state.selectedPayment = action.payload;
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch payment history";
      })
      // Fetch Payment By ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPayment = action.payload;
        state.error = null;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch payment";
      })
      // Initiate Payment
      .addCase(initiatePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to initiate payment";
      })
      // Verify Manual Payment
      .addCase(verifyManualPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyManualPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.payments.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(verifyManualPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify payment";
      });
  },
});

export const { clearError, setSelectedPayment, clearSelectedPayment } =
  paymentsSlice.actions;
export default paymentsSlice.reducer;
