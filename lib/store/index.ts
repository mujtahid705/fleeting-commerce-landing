import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import plansReducer from "./slices/plansSlice";
import productsReducer from "./slices/productsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import ordersReducer from "./slices/ordersSlice";
import inventoryReducer from "./slices/inventorySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: plansReducer,
    products: productsReducer,
    categories: categoriesReducer,
    orders: ordersReducer,
    inventory: inventoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
