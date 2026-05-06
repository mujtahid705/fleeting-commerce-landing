"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, X, Zap } from "lucide-react";
import { useAppSelector } from "@/lib/store/hooks";

export default function SubscriptionBanner() {
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const { subscription, access } = useAppSelector((state) => state.auth);

  if (dismissed || !access || !subscription) return null;

  const { daysRemaining, isInGracePeriod, gracePeriodDaysRemaining } = access;
  const isTrial = subscription.status === "TRIAL";

  // Grace period — always show regardless of daysRemaining
  if (isInGracePeriod) {
    return (
      <div className="mx-0 mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
        <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium text-red-800">
          Subscription expired.{" "}
          {gracePeriodDaysRemaining > 0
            ? `${gracePeriodDaysRemaining} day${gracePeriodDaysRemaining === 1 ? "" : "s"} left in grace period.`
            : "Grace period ending soon."}{" "}
          Pay now to keep your store online.
        </p>
        <button
          onClick={() => router.push("/plans?renew=1")}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
        >
          Pay Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Trial ending in ≤ 3 days
  if (isTrial && daysRemaining <= 3 && daysRemaining > 0) {
    return (
      <div className="mx-0 mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20">
        <Zap size={18} className="text-primary flex-shrink-0" />
        <p className="flex-1 text-sm font-medium text-foreground">
          Trial ends in{" "}
          <span className="font-bold text-primary">
            {daysRemaining} day{daysRemaining === 1 ? "" : "s"}
          </span>
          . Pick a plan to keep going.
        </p>
        <button
          onClick={() => router.push("/plans?renew=1")}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold transition-colors"
        >
          Pick a Plan
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-primary/10 text-muted hover:text-foreground transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Last 10 days of paid subscription
  if (!isTrial && daysRemaining <= 10 && daysRemaining > 0) {
    return (
      <div className="mx-0 mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200">
        <Clock size={18} className="text-yellow-600 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium text-yellow-800">
          Your{" "}
          <span className="font-bold">{subscription.plan.name}</span> plan ends
          in{" "}
          <span className="font-bold">
            {daysRemaining} day{daysRemaining === 1 ? "" : "s"}
          </span>
          . Renew now to avoid interruption.
        </p>
        <button
          onClick={() => router.push("/plans?renew=1")}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-semibold transition-colors"
        >
          Renew Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-yellow-100 text-yellow-400 hover:text-yellow-600 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return null;
}
