import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Admin,
  TenantAdminsState,
  CreateTenantAdminPayload,
  UpdateTenantAdminStatusPayload,
} from "@/lib/types/admins";

const initialState: TenantAdminsState = {
  admins: [],
  isLoading: false,
  isCreating: false,
  isUpdatingStatus: false,
  isDeleting: false,
  activeActionId: null,
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

// Enable or disable tenant admin
export const updateTenantAdminStatus = createAsyncThunk<
  Admin,
  UpdateTenantAdminStatusPayload,
  { rejectValue: string }
>(
  "tenantAdmins/updateStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/users/tenant-admin/${id}/status`, {
        isActive,
      });
      return response.data.data || response.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
      };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update tenant admin status"
      );
    }
  }
);

// Delete tenant admin
export const deleteTenantAdmin = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("tenantAdmins/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/users/tenant-admin/${id}`);
    return id;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete tenant admin"
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
      })
      // Update tenant admin status
      .addCase(updateTenantAdminStatus.pending, (state, action) => {
        state.isUpdatingStatus = true;
        state.activeActionId = action.meta.arg.id;
        state.error = null;
      })
      .addCase(updateTenantAdminStatus.fulfilled, (state, action) => {
        state.isUpdatingStatus = false;
        state.activeActionId = null;
        const updatedAdmin = action.payload;
        const admin = state.admins.find((item) => item.id === updatedAdmin.id);
        if (admin) {
          admin.isActive = updatedAdmin.isActive;
          admin.updatedAt = updatedAdmin.updatedAt ?? admin.updatedAt;
        }
      })
      .addCase(updateTenantAdminStatus.rejected, (state, action) => {
        state.isUpdatingStatus = false;
        state.activeActionId = null;
        state.error =
          action.payload || "Failed to update tenant admin status";
      })
      // Delete tenant admin
      .addCase(deleteTenantAdmin.pending, (state, action) => {
        state.isDeleting = true;
        state.activeActionId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteTenantAdmin.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.activeActionId = null;
        state.admins = state.admins.filter(
          (admin) => admin.id !== action.payload
        );
      })
      .addCase(deleteTenantAdmin.rejected, (state, action) => {
        state.isDeleting = false;
        state.activeActionId = null;
        state.error = action.payload || "Failed to delete tenant admin";
      });
  },
});

export const { clearError } = tenantAdminsSlice.actions;

export default tenantAdminsSlice.reducer;
