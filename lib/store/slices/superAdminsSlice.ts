import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Admin,
  SuperAdminsState,
  CreateSuperAdminPayload,
} from "@/lib/types/admins";

const initialState: SuperAdminsState = {
  admins: [],
  isLoading: false,
  isCreating: false,
  error: null,
};

// Fetch all super admins
export const fetchSuperAdmins = createAsyncThunk<
  Admin[],
  void,
  { rejectValue: string }
>("superAdmins/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/users/super-admins");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch super admins"
    );
  }
});

// Create super admin
export const createSuperAdmin = createAsyncThunk<
  Admin,
  CreateSuperAdminPayload,
  { rejectValue: string }
>("superAdmins/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await api.post("/auth/register/super-admin", payload);
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create super admin"
    );
  }
});

const superAdminsSlice = createSlice({
  name: "superAdmins",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch super admins
      .addCase(fetchSuperAdmins.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuperAdmins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchSuperAdmins.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch super admins";
      })
      // Create super admin
      .addCase(createSuperAdmin.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSuperAdmin.fulfilled, (state, action) => {
        state.isCreating = false;
        state.admins.push(action.payload);
      })
      .addCase(createSuperAdmin.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create super admin";
      });
  },
});

export const { clearError } = superAdminsSlice.actions;

export default superAdminsSlice.reducer;
