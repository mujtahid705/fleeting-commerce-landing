import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  InventoryItem,
  InventoryState,
  AddInventoryData,
  UpdateInventoryData,
} from "@/lib/types/inventory";

const initialState: InventoryState = {
  items: [],
  selectedItem: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

// Fetch all inventory items
export const fetchInventory = createAsyncThunk<
  InventoryItem[],
  void,
  { rejectValue: string }
>("inventory/fetchInventory", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/inventory/all");
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch inventory"
    );
  }
});

// Fetch low stock items
export const fetchLowStock = createAsyncThunk<
  InventoryItem[],
  number,
  { rejectValue: string }
>("inventory/fetchLowStock", async (threshold = 10, { rejectWithValue }) => {
  try {
    const response = await api.get(
      `/inventory/low-stock?threshold=${threshold}`
    );
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch low stock items"
    );
  }
});

// Fetch out of stock items
export const fetchOutOfStock = createAsyncThunk<
  InventoryItem[],
  void,
  { rejectValue: string }
>("inventory/fetchOutOfStock", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/inventory/out-of-stock");
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch out of stock items"
    );
  }
});

// Fetch single inventory item by product ID
export const fetchInventoryItem = createAsyncThunk<
  InventoryItem,
  string,
  { rejectValue: string }
>("inventory/fetchInventoryItem", async (productId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/inventory/${productId}`);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch inventory item"
    );
  }
});

// Add product to inventory
export const addToInventory = createAsyncThunk<
  InventoryItem,
  AddInventoryData,
  { rejectValue: string }
>("inventory/addToInventory", async (data, { rejectWithValue }) => {
  try {
    const response = await api.post("/inventory/add-product", data);
    return response.data.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to add to inventory"
    );
  }
});

// Update inventory quantity
export const updateInventoryQuantity = createAsyncThunk<
  InventoryItem,
  UpdateInventoryData,
  { rejectValue: string }
>(
  "inventory/updateInventoryQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/inventory/update-quantity/${productId}`,
        {
          quantity,
        }
      );
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message || "Failed to update inventory"
      );
    }
  }
);

// Delete inventory item
export const deleteInventoryItem = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("inventory/deleteInventoryItem", async (productId, { rejectWithValue }) => {
  try {
    await api.delete(`/inventory/delete-item/${productId}`);
    return productId;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(
      err.response?.data?.message || "Failed to delete inventory item"
    );
  }
});

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch inventory";
      })

      // Fetch Low Stock
      .addCase(fetchLowStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch low stock items";
      })

      // Fetch Out of Stock
      .addCase(fetchOutOfStock.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOutOfStock.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchOutOfStock.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch out of stock items";
      })

      // Fetch Single Item
      .addCase(fetchInventoryItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchInventoryItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch inventory item";
      })

      // Add to Inventory
      .addCase(addToInventory.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(addToInventory.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items.unshift(action.payload);
      })
      .addCase(addToInventory.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to add to inventory";
      })

      // Update Inventory
      .addCase(updateInventoryQuantity.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateInventoryQuantity.fulfilled, (state, action) => {
        state.isSubmitting = false;
        const index = state.items.findIndex(
          (item) => item.productId === action.payload.productId
        );
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })
      .addCase(updateInventoryQuantity.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to update inventory";
      })

      // Delete Inventory Item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.items = state.items.filter(
          (item) => item.productId !== action.payload
        );
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to delete inventory item";
      });
  },
});

export const { clearError, setSelectedItem, clearSelectedItem } =
  inventorySlice.actions;
export default inventorySlice.reducer;
