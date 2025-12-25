import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Order,
  OrdersState,
  CreateOrderData,
  UpdateOrderStatusData,
} from "@/lib/types/orders";

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Fetch all orders (TENANT_ADMIN)
export const fetchOrders = createAsyncThunk<
  Order[],
  void,
  { rejectValue: string }
>("orders/fetchOrders", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/orders/all");
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// Fetch orders by user ID
export const fetchOrdersByUser = createAsyncThunk<
  Order[],
  string,
  { rejectValue: string }
>("orders/fetchOrdersByUser", async (userId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/orders/${userId}`);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch orders"
    );
  }
});

// Create order
export const createOrder = createAsyncThunk<
  Order,
  CreateOrderData,
  { rejectValue: string }
>("orders/createOrder", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/orders/create", data);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to create order"
    );
  }
});

// Update order status
export const updateOrderStatus = createAsyncThunk<
  Order,
  UpdateOrderStatusData,
  { rejectValue: string }
>("orders/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/orders/update/status/${id}`, { status });
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to update order status"
    );
  }
});

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      // Fetch Orders by User
      .addCase(fetchOrdersByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to create order";
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...action.payload };
        }
        if (state.selectedOrder?.id === action.payload.id) {
          state.selectedOrder = { ...state.selectedOrder, ...action.payload };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to update order status";
      });
  },
});

export const { clearError, setSelectedOrder, clearSelectedOrder } =
  ordersSlice.actions;
export default ordersSlice.reducer;
