import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Admin,
  TenantAdminsState,
  CreateTenantAdminPayload,
} from "@/lib/types/admins";

const initialState: TenantAdminsState = {
  admins: [],
  isLoading: false,
  isCreating: false,
  error: null,
};

// Fetch tenant admins
export const fetchTenantAdmins = createAsyncThunk<
  Admin[],
  void,
  { rejectValue: string }
>("tenantAdmins/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/users/tenant-admins");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch tenant admins"
    );
  }
});

// Create tenant admin
export const createTenantAdmin = createAsyncThunk<
  Admin,
  CreateTenantAdminPayload,
  { rejectValue: string }
>("tenantAdmins/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register/tenant-admin", payload);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create tenant admin"
    );
  }
});

const tenantAdminsSlice = createSlice({
  name: "tenantAdmins",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tenant admins
      .addCase(fetchTenantAdmins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchTenantAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch tenant admins";
      })
      // Create tenant admin
      .addCase(createTenantAdmin.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createTenantAdmin.fulfilled, (state, action) => {
        state.isCreating = false;
        state.admins.push(action.payload);
      })
      .addCase(createTenantAdmin.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create tenant admin";
      });
  },
});

export const { clearError } = tenantAdminsSlice.actions;

export default tenantAdminsSlice.reducer;
