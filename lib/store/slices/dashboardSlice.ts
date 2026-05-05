import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { DashboardRange, DashboardState, OverviewResponse } from "@/lib/types/dashboard";

export const fetchOverview = createAsyncThunk(
  "dashboard/fetchOverview",
  async (range: DashboardRange, { rejectWithValue }) => {
    try {
      const res = await api.get<{ data: OverviewResponse }>(
        `/analytics/overview?range=${range}`
      );
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        error.response?.data?.message ?? "Failed to load dashboard data"
      );
    }
  }
);

const initialState: DashboardState = {
  overview: null,
  range: "30d",
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setRange(state, action: PayloadAction<DashboardRange>) {
      state.range = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
