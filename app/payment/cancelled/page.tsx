"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, ArrowLeft, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Spinner from "@/components/ui/Spinner";

function PaymentCancelledContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
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
              className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8"
            >
              <Ban className="w-12 h-12 text-amber-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Payment Cancelled
            </h1>
            <p className="text-muted mb-2">
              You cancelled the payment process.
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
                No worries!
              </h3>
              <p className="text-sm text-muted">
                Your payment was not processed and no charges were made. You can
                try again whenever you&apos;re ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/plans")}
                size="lg"
                className="flex-1 gap-2"
              >
                <RefreshCw size={18} />
                Choose a Plan
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="lg"
                className="flex-1 gap-2"
              >
                <ArrowLeft size={18} />
                Go Home
              </Button>
            </div>
          </motion.div>
        </Container>
      </main>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <PaymentCancelledContent />
    </Suspense>
  );
}
