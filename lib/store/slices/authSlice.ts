import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  AuthState,
  LoginRequest,
  LoginResponse,
  ValidateSessionResponse,
  User,
  RegisterTenantAdminRequest,
  RegisterTenantAdminResponse,
} from "@/lib/types/auth";

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  tenant: null,
  subscription: null,
  access: null,
  usage: null,
  unreadNotifications: 0,
  isLoading: false,
  isAuthenticated: false,
  sessionValidated: false,
  error: null,
};

// Login
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post<LoginResponse>("/auth/login", credentials);

    if (typeof window !== "undefined") {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string }; status?: number };
    };

    if (err.response?.status === 404) {
      return rejectWithValue("User not found. Please check your email.");
    }
    if (err.response?.status === 401) {
      return rejectWithValue("Invalid password. Please try again.");
    }

    return rejectWithValue(
      err.response?.data?.message || "Login failed. Please try again."
    );
  }
});

// Validate Session
export const validateSession = createAsyncThunk<
  ValidateSessionResponse,
  void,
  { rejectValue: string }
>("auth/validateSession", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<ValidateSessionResponse>(
      "/auth/validate-session"
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string }; status?: number };
    };

    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    return rejectWithValue(
      err.response?.data?.message || "Session validation failed"
    );
  }
});

// Logout
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
  return null;
});

// Register Tenant Admin
export const registerTenantAdmin = createAsyncThunk<
  RegisterTenantAdminResponse,
  RegisterTenantAdminRequest,
  { rejectValue: string }
>("auth/registerTenantAdmin", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post<RegisterTenantAdminResponse>(
      "/auth/register/tenant-admin-with-tenant",
      data
    );
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string }; status?: number };
    };

    if (err.response?.status === 400) {
      return rejectWithValue(
        err.response?.data?.message || "Email has already been taken."
      );
    }

    return rejectWithValue(
      err.response?.data?.message || "Registration failed. Please try again."
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetSessionValidated: (state) => {
      state.sessionValidated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      })
      // Validate Session
      .addCase(validateSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(validateSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.sessionValidated = true;
        state.user = action.payload.data.user;
        state.tenant = action.payload.data.tenant;
        state.subscription = action.payload.data.subscription;
        state.access = action.payload.data.access;
        state.usage = action.payload.data.usage;
        state.unreadNotifications = action.payload.data.unreadNotifications;
        state.error = null;
      })
      .addCase(validateSession.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.sessionValidated = true;
        state.user = null;
        state.token = null;
        state.tenant = null;
        state.subscription = null;
        state.access = null;
        state.usage = null;
        state.error = action.payload || "Session validation failed";
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.tenant = null;
        state.subscription = null;
        state.access = null;
        state.usage = null;
        state.unreadNotifications = 0;
        state.isAuthenticated = false;
        state.sessionValidated = false;
        state.error = null;
      })
      // Register Tenant Admin
      .addCase(registerTenantAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerTenantAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerTenantAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      });
  },
});

export const { clearError, setUser, resetSessionValidated } = authSlice.actions;
export default authSlice.reducer;
