import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  OffersState,
  SaleDiscount,
  Coupon,
  CreateSaleDiscountPayload,
  UpdateSaleDiscountPayload,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/lib/types/offers";

// ── Sale Discount Thunks ──────────────────────────────────────────────────────

export const fetchSaleDiscounts = createAsyncThunk(
  "offers/fetchSaleDiscounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<{ data: SaleDiscount[] }>("/discounts/sales");
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to fetch sale discounts");
    }
  }
);

export const createSaleDiscount = createAsyncThunk(
  "offers/createSaleDiscount",
  async (payload: CreateSaleDiscountPayload, { rejectWithValue }) => {
    try {
      const res = await api.post<{ data: SaleDiscount }>("/discounts/sales", payload);
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to create sale discount");
    }
  }
);

export const updateSaleDiscount = createAsyncThunk(
  "offers/updateSaleDiscount",
  async (payload: UpdateSaleDiscountPayload, { rejectWithValue }) => {
    try {
      const { id, ...rest } = payload;
      const res = await api.patch<{ data: SaleDiscount }>(`/discounts/sales/${id}`, rest);
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to update sale discount");
    }
  }
);

export const deleteSaleDiscount = createAsyncThunk(
  "offers/deleteSaleDiscount",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/discounts/sales/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to delete sale discount");
    }
  }
);

// ── Coupon Thunks ─────────────────────────────────────────────────────────────

export const fetchCoupons = createAsyncThunk(
  "offers/fetchCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<{ data: Coupon[] }>("/discounts/coupons");
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to fetch coupons");
    }
  }
);

export const createCoupon = createAsyncThunk(
  "offers/createCoupon",
  async (payload: CreateCouponPayload, { rejectWithValue }) => {
    try {
      const res = await api.post<{ data: Coupon }>("/discounts/coupons", payload);
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to create coupon");
    }
  }
);

export const updateCoupon = createAsyncThunk(
  "offers/updateCoupon",
  async (payload: UpdateCouponPayload, { rejectWithValue }) => {
    try {
      const { id, ...rest } = payload;
      const res = await api.patch<{ data: Coupon }>(`/discounts/coupons/${id}`, rest);
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to update coupon");
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  "offers/deleteCoupon",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/discounts/coupons/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to delete coupon");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: OffersState = {
  sales: [],
  coupons: [],
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const offersSlice = createSlice({
  name: "offers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchSaleDiscounts
      .addCase(fetchSaleDiscounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSaleDiscounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sales = action.payload;
      })
      .addCase(fetchSaleDiscounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createSaleDiscount
      .addCase(createSaleDiscount.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createSaleDiscount.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.sales.push(action.payload);
      })
      .addCase(createSaleDiscount.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // updateSaleDiscount
      .addCase(updateSaleDiscount.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateSaleDiscount.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.sales.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.sales[idx] = action.payload;
      })
      .addCase(updateSaleDiscount.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // deleteSaleDiscount
      .addCase(deleteSaleDiscount.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteSaleDiscount.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.sales = state.sales.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSaleDiscount.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // fetchCoupons
      .addCase(fetchCoupons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // createCoupon
      .addCase(createCoupon.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.coupons.push(action.payload);
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // updateCoupon
      .addCase(updateCoupon.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const idx = state.coupons.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.coupons[idx] = action.payload;
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // deleteCoupon
      .addCase(deleteCoupon.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.coupons = state.coupons.filter((c) => c.id !== action.payload);
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export default offersSlice.reducer;
