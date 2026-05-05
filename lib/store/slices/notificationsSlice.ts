import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { NotificationItem, NotificationsState } from "@/lib/types/notifications";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<{ data: NotificationItem[] }>("/notifications");
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to fetch notifications");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notifications/fetchUnreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<{ data: { unreadCount: number } }>("/notifications/unread-count");
      return res.data.data.unreadCount;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to fetch unread count");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.patch<{ data: NotificationItem }>(`/notifications/${id}/read`);
      return res.data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to mark as read");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      await api.patch("/notifications/mark-all-read");
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to mark all as read");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${id}`);
      return id;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Failed to delete notification");
    }
  }
);

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  isDropdownOpen: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setDropdownOpen(state, action) {
      state.isDropdownOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNotifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchUnreadCount
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // markNotificationRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n.id === action.payload.id);
        if (idx !== -1 && !state.items[idx].isRead) {
          state.items[idx] = action.payload;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // markAllNotificationsRead
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      // deleteNotification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const removed = state.items.find((n) => n.id === action.payload);
        if (removed && !removed.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter((n) => n.id !== action.payload);
      });
  },
});

export const { setDropdownOpen } = notificationsSlice.actions;
export default notificationsSlice.reducer;
