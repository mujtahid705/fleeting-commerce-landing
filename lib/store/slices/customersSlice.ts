import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Customer, CustomersState } from "@/lib/types/customers";

const initialState: CustomersState = {
  customers: [],
  selectedCustomer: null,
  isLoading: false,
  error: null,
};

// Fetch customers by tenant (TENANT_ADMIN)
export const fetchCustomersByTenant = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>("customers/fetchByTenant", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/users/customers-by-tenant");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch customers"
    );
  }
});

// Update customer status (TENANT_ADMIN)
export const updateCustomerStatus = createAsyncThunk<
  Customer,
  { customerId: string; isActive: boolean },
  { rejectValue: string }
>(
  "customers/updateStatus",
  async ({ customerId, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.patch("/users/update-status", {
        customerId,
        isActive,
      });
      return response.data.data || response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update customer status"
      );
    }
  }
);

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomersByTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomersByTenant.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomersByTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch customers";
      })
      // Update customer status
      .addCase(updateCustomerStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.customers.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.selectedCustomer?.id === action.payload.id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update customer status";
      });
  },
});

export const { clearError, setSelectedCustomer, clearSelectedCustomer } =
  customersSlice.actions;

export default customersSlice.reducer;
