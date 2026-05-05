import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import plansReducer from "./slices/plansSlice";
import adminPlansReducer from "./slices/adminPlansSlice";
import productsReducer from "./slices/productsSlice";
import categoriesReducer from "./slices/categoriesSlice";
import ordersReducer from "./slices/ordersSlice";
import inventoryReducer from "./slices/inventorySlice";
import subscriptionsReducer from "./slices/subscriptionsSlice";
import paymentsReducer from "./slices/paymentsSlice";
import customersReducer from "./slices/customersSlice";
import usersReducer from "./slices/usersSlice";
import superAdminsReducer from "./slices/superAdminsSlice";
import tenantAdminsReducer from "./slices/tenantAdminsSlice";
import brandReducer from "./slices/brandSlice";
import notificationsReducer from "./slices/notificationsSlice";
import offersReducer from "./slices/offersSlice";

const appReducer = combineReducers({
  auth: authReducer,
  plans: plansReducer,
  adminPlans: adminPlansReducer,
  products: productsReducer,
  categories: categoriesReducer,
  orders: ordersReducer,
  inventory: inventoryReducer,
  subscriptions: subscriptionsReducer,
  payments: paymentsReducer,
  customers: customersReducer,
  users: usersReducer,
  superAdmins: superAdminsReducer,
  tenantAdmins: tenantAdminsReducer,
  brand: brandReducer,
  notifications: notificationsReducer,
  offers: offersReducer,
});

const rootReducer: typeof appReducer = (state, action) => {
  if (action.type === "auth/logout/fulfilled") {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
