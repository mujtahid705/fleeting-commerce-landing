"use client";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  PartyPopper,
  ExternalLink,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setBrandSetupCompleted,
  validateSession,
} from "@/lib/store/slices/authSlice";
import confetti from "canvas-confetti";

function BrandSetupSuccessContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { tenant, sessionValidated, isLoading } = useAppSelector(
    (state) => state.auth
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get the store domain from tenant
  const domain = tenant?.domain || "";

  const storeBaseUrl =
    process.env.NEXT_PUBLIC_STORE_BASE_URL || "http://localhost:3001";
  // Extract protocol and domain, then insert subdomain
  const urlMatch = storeBaseUrl.match(/^(https?:\/\/)(.+)$/);
  const protocol = urlMatch?.[1] || "http://";
  const baseDomain = urlMatch?.[2] || "localhost:3001";
  const storeUrl = domain ? `${protocol}${domain}.${baseDomain}` : "";

  // Validate session to ensure we have tenant data
  useEffect(() => {
    const initializeData = async () => {
      if (!sessionValidated) {
        await dispatch(validateSession());
      }
      setIsInitializing(false);
    };

    initializeData();
  }, [dispatch, sessionValidated]);

  useEffect(() => {
    // Only trigger confetti after data is loaded
    if (isInitializing || !tenant) return;

    // Trigger confetti animation
    setShowConfetti(true);
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#6366f1", "#818cf8", "#a855f7", "#22c55e"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#6366f1", "#818cf8", "#a855f7", "#22c55e"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isInitializing, tenant]);

  // Show loading state while fetching tenant data
  if (isInitializing || isLoading || !tenant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Loading your store details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
      </div>

      {/* Header */}
      <header className="py-6 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Container>
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Fleeting<span className="text-primary">Commerce</span>
              </span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Container className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-8 inline-flex"
            >
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <PartyPopper className="w-14 h-14 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center"
                >
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              🎉 Congratulations!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted mb-8"
            >
              Your store is now live and ready for customers!
            </motion.p>

            {/* Store URL Card */}
            {storeUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mb-8"
              >
                <p className="text-sm text-muted mb-3">Your store is live at</p>
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-lg md:text-2xl font-semibold text-primary hover:text-primary/80 transition-colors break-all"
                >
                  <span className="bg-primary/5 px-4 py-2 rounded-xl">
                    {storeUrl}
                  </span>
                  <ExternalLink className="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </motion.div>
            )}

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-primary/5 to-purple-50 rounded-2xl p-6 mb-8"
            >
              <h3 className="font-semibold text-foreground mb-4">
                What&apos;s next?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Add Products
                    </p>
                    <p className="text-xs text-muted">
                      Start listing your items
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Set Up Payments
                    </p>
                    <p className="text-xs text-muted">
                      Configure payment methods
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Share Your Store
                    </p>
                    <p className="text-xs text-muted">
                      Invite your first customers
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={() => {
                  dispatch(setBrandSetupCompleted());
                  router.push("/dashboard");
                }}
                className="group"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              {storeUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(storeUrl, "_blank")}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visit Your Store
                </Button>
              )}
            </motion.div>
          </motion.div>
        </Container>
      </main>
    </div>
  );
}

export default function BrandSetupSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <BrandSetupSuccessContent />
    </Suspense>
  );
}
