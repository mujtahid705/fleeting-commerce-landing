"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ButtonSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  loginUser,
  validateSession,
  clearError,
  resetSessionValidated,
} from "@/lib/store/slices/authSlice";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const hasValidatedSession = useRef(false);
  const hasShownSuccessToast = useRef(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const {
    isLoading,
    error,
    isAuthenticated,
    user,
    subscription,
    sessionValidated,
  } = useAppSelector((state) => state.auth);

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(resetSessionValidated());
    hasValidatedSession.current = false;
    hasShownSuccessToast.current = false;
  }, [dispatch]);

  // Validate session after login
  useEffect(() => {
    if (isAuthenticated && !sessionValidated && !hasValidatedSession.current) {
      hasValidatedSession.current = true;
      dispatch(validateSession());
    }
  }, [isAuthenticated, sessionValidated, dispatch]);

  // Handle navigation after session validation
  useEffect(() => {
    if (
      isAuthenticated &&
      sessionValidated &&
      user &&
      !hasShownSuccessToast.current
    ) {
      hasShownSuccessToast.current = true;
      showToast({
        type: "success",
        title: "Welcome back!",
        message: "You have successfully signed in.",
      });

      // TENANT_ADMIN without subscription goes to plans page
      if (user.role === "TENANT_ADMIN" && !subscription) {
        router.push("/plans");
      } else {
        router.push("/dashboard");
      }
    }
  }, [
    isAuthenticated,
    sessionValidated,
    user,
    subscription,
    router,
    showToast,
  ]);

  // Show error toast
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Login Failed",
        message: error,
      });
    }
  }, [error, showToast]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      {/* Mobile Logo */}
      <div className="lg:hidden flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Fleeting<span className="text-primary">Commerce</span>
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Welcome back
        </h2>
        <p className="text-muted">Sign in to your account to continue</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={formErrors.email}
          icon={<Mail size={20} />}
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={formErrors.password}
          icon={<Lock size={20} />}
          disabled={isLoading}
        />

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full inline-flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <ButtonSpinner />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted">
            Or continue with
          </span>
        </div>
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-medium">Google</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-sm font-medium">GitHub</span>
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="mt-8 text-center text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-primary font-medium hover:text-primary-dark transition-colors"
        >
          Sign up for free
        </Link>
      </p>
    </motion.div>
  );
}
