"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { validateSession } from "@/lib/store/slices/authSlice";
import Spinner from "@/components/ui/Spinner";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const transactionId = searchParams.get("transactionId");
  const { tenant } = useAppSelector((state) => state.auth);

  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const refreshSession = async () => {
      await dispatch(validateSession());
      setIsValidating(false);

      showToast({
        type: "success",
        title: "Payment Successful!",
        message: "Your subscription has been activated.",
      });
    };

    refreshSession();
  }, [dispatch, showToast]);

  const handleContinue = () => {
    if (tenant?.brandSetupCompleted) {
      router.push("/dashboard");
    } else {
      router.push("/brand-setup");
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="py-6">
        <Container>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Fleeting<span className="text-primary">Commerce</span>
            </span>
          </Link>
        </Container>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-muted mb-2">
              Your subscription has been activated successfully.
            </p>
            {transactionId && (
              <p className="text-sm text-muted mb-8">
                Transaction ID:{" "}
                <span className="font-mono text-foreground">
                  {transactionId}
                </span>
              </p>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
              <h3 className="font-semibold text-foreground mb-2">
                What's next?
              </h3>
              <p className="text-sm text-muted">
                {tenant?.brandSetupCompleted
                  ? "Head to your dashboard to start managing your store."
                  : "Set up your brand identity to get your store ready for customers."}
              </p>
            </div>

            <Button onClick={handleContinue} size="lg" className="w-full gap-2">
              {tenant?.brandSetupCompleted
                ? "Go to Dashboard"
                : "Set Up Your Brand"}
              <ArrowRight size={18} />
            </Button>
          </motion.div>
        </Container>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
