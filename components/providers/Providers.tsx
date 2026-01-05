"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ToastProvider } from "@/components/ui/Toast";
import AuthInitializer from "./AuthInitializer";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </ToastProvider>
    </Provider>
  );
}
