import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Customer, UsersState } from "@/lib/types/customers";

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
};

// Fetch all users (SUPER_ADMIN)
export const fetchAllUsers = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>("users/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/users/all");
    return response.data.data || response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { data?: { message?: string } };
    };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch users"
    );
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch users";
      });
  },
});

export const { clearError, setSelectedUser, clearSelectedUser } =
  usersSlice.actions;

export default usersSlice.reducer;
