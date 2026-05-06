import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Review,
  ReviewsState,
  FetchReviewsParams,
} from "@/lib/types/reviews";

interface ReviewsResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: ReviewsState = {
  reviews: [],
  selectedReview: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
  isLoading: false,
  isSubmitting: false,
  error: null,
};

export const fetchReviews = createAsyncThunk<
  ReviewsResponse,
  FetchReviewsParams,
  { rejectValue: string }
>("reviews/fetchReviews", async (params, { rejectWithValue }) => {
  try {
    const response = await api.get("/reviews", { params });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch reviews"
    );
  }
});

export const fetchReviewById = createAsyncThunk<
  Review,
  string,
  { rejectValue: string }
>("reviews/fetchReviewById", async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/reviews/${id}`);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch review"
    );
  }
});

export const deactivateReview = createAsyncThunk<
  { id: string; isActive: boolean; updatedAt: string },
  string,
  { rejectValue: string }
>("reviews/deactivateReview", async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/reviews/${id}/deactivate`);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to deactivate review"
    );
  }
});

export const activateReview = createAsyncThunk<
  { id: string; isActive: boolean; updatedAt: string },
  string,
  { rejectValue: string }
>("reviews/activateReview", async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/reviews/${id}/activate`);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to activate review"
    );
  }
});

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedReview: (state, action) => {
      state.selectedReview = action.payload;
    },
    clearSelectedReview: (state) => {
      state.selectedReview = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch reviews";
      })

      // Fetch Review By Id
      .addCase(fetchReviewById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedReview = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch review";
      })

      // Deactivate Review
      .addCase(deactivateReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deactivateReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.reviews.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.reviews[idx] = { ...state.reviews[idx], isActive: false, updatedAt: action.payload.updatedAt };
        }
        if (state.selectedReview?.id === action.payload.id) {
          state.selectedReview = { ...state.selectedReview, isActive: false, updatedAt: action.payload.updatedAt };
        }
      })
      .addCase(deactivateReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to deactivate review";
      })

      // Activate Review
      .addCase(activateReview.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(activateReview.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.reviews.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.reviews[idx] = { ...state.reviews[idx], isActive: true, updatedAt: action.payload.updatedAt };
        }
        if (state.selectedReview?.id === action.payload.id) {
          state.selectedReview = { ...state.selectedReview, isActive: true, updatedAt: action.payload.updatedAt };
        }
      })
      .addCase(activateReview.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to activate review";
      });
  },
});

export const { clearError, setSelectedReview, clearSelectedReview } =
  reviewsSlice.actions;
export default reviewsSlice.reducer;
