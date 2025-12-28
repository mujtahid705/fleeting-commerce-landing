"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Shield, Clock } from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PlanCard from "@/components/ui/PlanCard";
import { PageLoader } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchPlans,
  activateTrial,
  selectPlan,
  initiatePayment,
  setSelectedPlanId,
  Plan,
} from "@/lib/store/slices/plansSlice";

interface PlanFeature {
  text: string;
  included: boolean;
}

const guarantees = [
  {
    icon: Shield,
    title: "Money Back Guarantee",
    description: "30-day full refund if not satisfied",
  },
  {
    icon: Clock,
    title: "Cancel Anytime",
    description: "No long-term contracts or commitments",
  },
];

// Helper function to generate features from plan data
const generateFeatures = (plan: Plan, allPlans: Plan[]): PlanFeature[] => {
  const maxPlan = allPlans.reduce((max, p) => (p.price > max.price ? p : max));

  const features: PlanFeature[] = [
    {
      text:
        plan.maxProducts === -1
          ? "Unlimited products"
          : `Up to ${plan.maxProducts} products`,
      included: true,
    },
    {
      text:
        plan.maxCategories === -1
          ? "Unlimited categories"
          : `Up to ${plan.maxCategories} categories`,
      included: true,
    },
    {
      text:
        plan.maxOrders === -1
          ? "Unlimited orders"
          : `Up to ${plan.maxOrders} orders/month`,
      included: plan.maxOrders > 50 || plan.maxOrders === -1,
    },
    {
      text: "Custom domain",
      included: plan.customDomain,
    },
    {
      text: "Priority support",
      included: plan.price >= 999,
    },
    {
      text: "Advanced analytics",
      included: plan.price >= 2499 || plan.price === maxPlan.price,
    },
  ];

  return features;
};

// Helper to determine if a plan should be marked as popular
const isPopularPlan = (plan: Plan): boolean => {
  return plan.name.toLowerCase() === "starter";
};

// Helper to get badge text
const getBadge = (plan: Plan): string | undefined => {
  if (plan.trialDays > 0) return "Try Free";
  if (
    plan.name.toLowerCase().includes("growth") ||
    plan.name.toLowerCase().includes("pro")
  )
    return "Most Popular";
  if (plan.name.toLowerCase().includes("enterprise")) return "Best Value";
  return undefined;
};

// Helper to get button text
const getButtonText = (plan: Plan, isAuthenticated: boolean): string => {
  if (plan.trialDays > 0) return "Start Free Trial";
  if (plan.name.toLowerCase().includes("enterprise")) return "Contact Sales";
  return isAuthenticated ? "Select Plan" : "Get Started";
};

export default function PlansPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const { isAuthenticated, token, tenant } = useAppSelector(
    (state) => state.auth
  );
  const { plans, isLoading, isSelecting, selectedPlanId, error } =
    useAppSelector((state) => state.plans);

  // Filter out trial plans if user has already used trial
  const hasUsedTrial = tenant?.hasUsedTrial ?? false;
  const availablePlans = hasUsedTrial
    ? plans.filter((plan) => plan.trialDays === 0)
    : plans;

  // Fetch plans on mount
  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast({
        type: "error",
        title: "Error",
        message: error,
      });
    }
  }, [error, showToast]);

  const handleSelectPlan = async (plan: Plan) => {
    // If not authenticated, redirect to signup
    if (!isAuthenticated || !token) {
      router.push(`/signup?plan=${plan.id}`);
      return;
    }

    dispatch(setSelectedPlanId(plan.id));

    // If it's a free trial plan
    if (plan.trialDays > 0) {
      const result = await dispatch(activateTrial());
      if (activateTrial.fulfilled.match(result)) {
        showToast({
          type: "success",
          title: "Trial Activated!",
          message: `Your ${plan.trialDays}-day free trial has started.`,
        });
        router.push("/brand-setup");
      }
      return;
    }

    // For paid plans, select the plan first
    const selectResult = await dispatch(selectPlan(plan.id));

    if (selectPlan.fulfilled.match(selectResult)) {
      const data = selectResult.payload;

      if (data?.requiresPayment) {
        // Initiate payment
        const paymentResult = await dispatch(initiatePayment(plan.id));

        if (initiatePayment.fulfilled.match(paymentResult)) {
          const paymentData = paymentResult.payload;

          showToast({
            type: "info",
            title: "Redirecting to Payment",
            message: `Please complete payment of ${paymentData.currency} ${paymentData.amount}`,
          });

          // Redirect to SSLCommerz gateway
          if (paymentData.gatewayUrl) {
            window.location.href = paymentData.gatewayUrl;
          } else {
            router.push("/brand-setup");
          }
        }
      } else {
        showToast({
          type: "success",
          title: "Plan Selected!",
          message: "Your plan has been activated.",
        });
        router.push("/brand-setup");
      }
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Header */}
      <header className="py-6">
        <Container>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Fleeting<span className="text-primary">Commerce</span>
              </span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="py-16">
        <Container>
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your <span className="gradient-text">Perfect Plan</span>
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {hasUsedTrial
                ? "Select a plan to continue growing your business with Fleeting Commerce."
                : "Start with a 14-day free trial. No credit card required. Upgrade anytime to unlock more features."}
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch mb-16">
            {availablePlans.map((plan, index) => {
              const popular = isPopularPlan(plan);
              const features = generateFeatures(plan, availablePlans);
              const badge = popular ? "Most Popular" : getBadge(plan);
              const isCurrentlySelecting =
                isSelecting && selectedPlanId === plan.id;
              const buttonText = isCurrentlySelecting
                ? "Processing..."
                : getButtonText(plan, isAuthenticated);

              return (
                <PlanCard
                  key={plan.id}
                  name={plan.name}
                  price={
                    plan.price === 0
                      ? "Free"
                      : `৳${plan.price.toLocaleString()}`
                  }
                  period={
                    plan.trialDays > 0
                      ? `${plan.trialDays} days`
                      : plan.interval === "MONTHLY"
                      ? "month"
                      : "year"
                  }
                  description={
                    plan.trialDays > 0
                      ? `Try all features free for ${plan.trialDays} days. No credit card required.`
                      : plan.price < 2000
                      ? "Perfect for small businesses just getting started."
                      : plan.price < 5000
                      ? "Great for growing businesses and serious sellers."
                      : "For large businesses needing complete control and support."
                  }
                  features={features}
                  popular={popular}
                  badge={badge}
                  buttonText={buttonText}
                  onSelect={() => handleSelectPlan(plan)}
                  delay={index * 0.1}
                />
              );
            })}
          </div>

          {/* Guarantees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8"
          >
            {guarantees.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-muted">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </Container>
      </main>

      {/* FAQ Section */}
      <section className="py-16 bg-secondary/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="What happens after the 14-day trial?"
              answer="After your trial ends, you can choose to upgrade to a paid plan to continue using all features. If you don't upgrade, your store will be paused but your data will be saved for 30 days."
            />
            <FAQItem
              question="Can I change plans later?"
              answer="Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate any payments."
            />
            <FAQItem
              question="Is there a setup fee?"
              answer="No, there are no setup fees or hidden costs. You only pay the monthly subscription price for your chosen plan."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
            />
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-200">
        <Container>
          <p className="text-center text-muted text-sm">
            © {new Date().getFullYear()} Fleeting Commerce. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <span className="font-medium text-foreground">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          className="text-primary text-xl font-light"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-muted">{answer}</p>
      </motion.div>
    </motion.div>
  );
}
