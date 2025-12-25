"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { validateSession, logoutUser } from "@/lib/store/slices/authSlice";
import { PageLoader } from "@/components/ui/Spinner";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password"];

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  const { token, isLoading, sessionValidated, isAuthenticated } =
    useAppSelector((state) => state.auth);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (hasInitialized.current) return;

    const initAuth = async () => {
      if (!token) {
        if (!isPublicRoute) {
          router.push("/login");
        }
        return;
      }

      hasInitialized.current = true;
      const result = await dispatch(validateSession());

      if (validateSession.rejected.match(result)) {
        dispatch(logoutUser());
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
    };

    initAuth();
  }, [dispatch, token, isPublicRoute, router]);

  // Show loader while validating session on protected routes
  if (!isPublicRoute && token && !sessionValidated && isLoading) {
    return <PageLoader />;
  }

  // Redirect to login if not authenticated on protected routes
  if (!isPublicRoute && !token && !isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
