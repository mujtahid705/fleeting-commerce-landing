"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  validateSession,
  logoutUser,
  clearError,
} from "@/lib/store/slices/authSlice";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/payment/success",
  "/payment/failed",
  "/payment/cancelled",
];

const PLANS_ROUTE = "/plans";
const BRAND_SETUP_ROUTE = "/brand-setup";
const BRAND_SETUP_SUCCESS_ROUTE = "/brand-setup/success";
const DASHBOARD_ROUTES_PREFIX = "/dashboard";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const hasInitialized = useRef(false);
  const hasShownTrialExpiredToast = useRef(false);

  const {
    token,
    isLoading,
    sessionValidated,
    user,
    tenant,
    subscription,
    access,
  } = useAppSelector((state) => state.auth);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPlansRoute = pathname === PLANS_ROUTE;
  const isBrandSetupRoute = pathname === BRAND_SETUP_ROUTE;
  const isBrandSetupSuccessRoute = pathname === BRAND_SETUP_SUCCESS_ROUTE;
  const isDashboardRoute = pathname.startsWith(DASHBOARD_ROUTES_PREFIX);

  // Session validation on mount
  useEffect(() => {
    if (hasInitialized.current) return;

    const initAuth = async () => {
      if (!token) {
        if (!isPublicRoute && !isPlansRoute) {
          router.push("/login");
        }
        return;
      }

      hasInitialized.current = true;
      const result = await dispatch(validateSession());

      if (validateSession.rejected.match(result)) {
        await dispatch(logoutUser());
        dispatch(clearError());
        if (!isPublicRoute && !isPlansRoute) {
          router.push("/login");
        }
      }
    };

    initAuth();
  }, [dispatch, token, isPublicRoute, isPlansRoute, router]);

  // Route protection and redirection logic
  useEffect(() => {
    if (!sessionValidated || !user) return;

    const isTenantAdmin = user.role === "TENANT_ADMIN";
    const isSuperAdmin = user.role === "SUPER_ADMIN";

    // Super admins can access everything
    if (isSuperAdmin) return;

    // Only apply restrictions to TENANT_ADMIN
    if (!isTenantAdmin) return;

    const hasSubscription = !!subscription;
    const hasActiveAccess = access?.hasAccess ?? false;
    const isTrialExpired =
      subscription?.status === "EXPIRED" ||
      (subscription?.status === "TRIAL" && !hasActiveAccess);
    const brandSetupDone = tenant?.brandSetupCompleted ?? false;

    // Case 1: No subscription - redirect to plans (block brand-setup too)
    if (!hasSubscription && !isPlansRoute && !isPublicRoute) {
      router.push("/plans");
      return;
    }

    // Case 2: Trial expired - redirect to plans with toast
    if (isTrialExpired && !isPlansRoute && !isPublicRoute) {
      if (!hasShownTrialExpiredToast.current) {
        hasShownTrialExpiredToast.current = true;
        showToast({
          type: "warning",
          title: "Trial Expired",
          message:
            "Your free trial has ended. Please select a plan to continue.",
        });
      }
      router.push("/plans");
      return;
    }

    // Case 3: Has subscription but brand setup not complete
    if (hasSubscription && !brandSetupDone && hasActiveAccess) {
      if (isDashboardRoute) {
        router.push("/brand-setup");
        return;
      }
    }

    // Case 4: Brand setup complete - redirect to dashboard only from brand-setup page
    if (hasSubscription && brandSetupDone && hasActiveAccess) {
      if (isBrandSetupRoute) {
        router.push("/dashboard");
        return;
      }
    }
  }, [
    sessionValidated,
    user,
    subscription,
    access,
    tenant,
    pathname,
    router,
    showToast,
    isPlansRoute,
    isBrandSetupRoute,
    isDashboardRoute,
    isPublicRoute,
  ]);

  // Show loader while validating session on protected routes
  if (
    !isPublicRoute &&
    !isPlansRoute &&
    token &&
    !sessionValidated &&
    isLoading
  ) {
    return <PageLoader />;
  }

  // Redirect to login if not authenticated on protected routes (except plans)
  if (!isPublicRoute && !isPlansRoute && !token && !isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
