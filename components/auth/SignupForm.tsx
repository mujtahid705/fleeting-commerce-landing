"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Zap,
  CheckCircle,
  ArrowLeft,
  Phone,
  Store,
  KeyRound,
  Timer,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ButtonSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  initiateRegistration,
  verifyOtpAndRegister,
  resendOtp,
  loginUser,
  clearError,
} from "@/lib/store/slices/authSlice";

type Step = "email" | "verify";

interface FormErrors {
  email?: string;
  otp?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  storeName?: string;
  general?: string;
}

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
];

const OTP_VALIDITY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const currentStep = (searchParams.get("step") as Step) || "email";

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Timer State
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showToast({ type: "error", title: "Error", message: error });
    }
  }, [error, showToast]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Resend Cooldown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const goToStep = useCallback(
    (step: Step) => {
      router.push(`/signup?step=${step}`);
    },
    [router]
  );

  // Email Validation
  const validateEmail = (): boolean => {
    const errors: FormErrors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Full Form Validation
  const validateVerifyForm = (): boolean => {
    const errors: FormErrors = {};

    if (!otp || otp.length !== 6) {
      errors.otp = "Please enter a valid 6-digit OTP";
    }

    if (!name.trim()) {
      errors.name = "Name is required";
    } else if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[0-9]{10,15}$/.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid phone number";
    }

    if (!storeName.trim()) {
      errors.storeName = "Store name is required";
    } else if (storeName.trim().length < 2) {
      errors.storeName = "Store name must be at least 2 characters";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (!passwordRequirements.every((req) => req.test(password))) {
      errors.password = "Password doesn't meet requirements";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    if (!acceptTerms) {
      errors.general = "You must accept the terms and conditions";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setIsSubmitting(true);
    const result = await dispatch(initiateRegistration({ email }));
    setIsSubmitting(false);

    if (initiateRegistration.fulfilled.match(result)) {
      showToast({
        type: "success",
        title: "OTP Sent!",
        message: `Check your inbox at ${email}`,
      });
      setOtpTimer(OTP_VALIDITY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      goToStep("verify");
    }
  };

  // Step 2: Verify OTP and Complete Registration
  const handleVerifyAndRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateVerifyForm()) return;

    setIsSubmitting(true);
    const result = await dispatch(
      verifyOtpAndRegister({
        email,
        otp,
        name: name.trim(),
        password,
        phone: phone.replace(/\s/g, ""),
        tenantName: storeName.trim(),
      })
    );
    setIsSubmitting(false);

    if (verifyOtpAndRegister.fulfilled.match(result)) {
      showToast({
        type: "success",
        title: "Account Created!",
        message: "Signing you in...",
      });

      const loginResult = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(loginResult)) {
        router.push("/plans");
      } else {
        router.push("/login");
      }
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);
    const result = await dispatch(resendOtp({ email }));
    setIsResending(false);

    if (resendOtp.fulfilled.match(result)) {
      showToast({
        type: "success",
        title: "OTP Resent!",
        message: `Check your inbox at ${email}`,
      });
      setOtpTimer(OTP_VALIDITY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleBackToEmail = () => {
    setOtp("");
    setFormErrors({});
    goToStep("email");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Back Navigation */}
      {currentStep === "email" ? (
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      ) : (
        <button
          onClick={handleBackToEmail}
          className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Change email</span>
        </button>
      )}

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

      <AnimatePresence mode="wait">
        {/* Step 1: Email */}
        {currentStep === "email" && (
          <motion.div
            key="email-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Create your account
              </h2>
              <p className="text-muted">Enter your email to get started</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                icon={<Mail size={20} />}
                disabled={isSubmitting}
                autoFocus
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ButtonSpinner />
                    Sending OTP...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:text-primary-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {/* Step 2: Verify & Complete */}
        {currentStep === "verify" && (
          <motion.div
            key="verify-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Verify & Complete
              </h2>
              <p className="text-muted">
                We sent a code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            {/* OTP Timer */}
            {otpTimer > 0 && (
              <div className="mb-6 flex items-center justify-center gap-2 text-sm">
                <Timer size={16} className="text-primary" />
                <span className="text-muted">
                  Code expires in{" "}
                  <span className="font-semibold text-foreground">
                    {formatTime(otpTimer)}
                  </span>
                </span>
              </div>
            )}

            {otpTimer === 0 && currentStep === "verify" && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center">
                OTP has expired. Please resend to get a new code.
              </div>
            )}

            {formErrors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm"
              >
                {formErrors.general}
              </motion.div>
            )}

            <form onSubmit={handleVerifyAndRegister} className="space-y-5">
              {/* OTP Input */}
              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                error={formErrors.otp}
                icon={<KeyRound size={20} />}
                disabled={isSubmitting}
                autoFocus
                maxLength={6}
              />

              {/* Resend Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-sm text-primary hover:text-primary-dark disabled:text-muted disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  {isResending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Resending...
                    </>
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      Resend code
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-gray-100 pt-5 space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={formErrors.name}
                  icon={<User size={20} />}
                  disabled={isSubmitting}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+8801XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={formErrors.phone}
                  icon={<Phone size={20} />}
                  disabled={isSubmitting}
                />

                <Input
                  label="Store Name"
                  type="text"
                  placeholder="My Awesome Store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  error={formErrors.storeName}
                  icon={<Store size={20} />}
                  disabled={isSubmitting}
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={formErrors.password}
                    icon={<Lock size={20} />}
                    disabled={isSubmitting}
                  />
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3 grid grid-cols-2 gap-2"
                    >
                      {passwordRequirements.map((req, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-xs ${
                            req.test(password) ? "text-green-600" : "text-muted"
                          }`}
                        >
                          <CheckCircle
                            size={14}
                            className={
                              req.test(password)
                                ? "text-green-600"
                                : "text-gray-300"
                            }
                          />
                          {req.label}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={formErrors.confirmPassword}
                  icon={<Lock size={20} />}
                  disabled={isSubmitting}
                />

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-muted">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-primary hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-primary hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || otpTimer === 0}
              >
                {isSubmitting ? (
                  <>
                    <ButtonSpinner />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-muted">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:text-primary-dark transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
