"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Zap, Shield, Clock } from "lucide-react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import PlanCard from "@/components/ui/PlanCard";

const plans = [
  {
    id: "trial",
    name: "Free Trial",
    price: "$0",
    period: "14 days",
    description: "Try all features free for 14 days. No credit card required.",
    badge: "Try Free",
    features: [
      { text: "Up to 50 products", included: true },
      { text: "Basic analytics", included: true },
      { text: "Email support", included: true },
      { text: "Custom domain", included: false },
      { text: "Priority support", included: false },
      { text: "Advanced analytics", included: false },
    ],
    buttonText: "Start Free Trial",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "month",
    description: "Perfect for growing businesses and serious sellers.",
    badge: "Most Popular",
    popular: true,
    features: [
      { text: "Unlimited products", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domain", included: true },
      { text: "Multiple payment gateways", included: true },
      { text: "White-label branding", included: false },
    ],
    buttonText: "Get Started",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    period: "month",
    description: "For large businesses needing complete control and support.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "White-label branding", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA guarantee", included: true },
      { text: "API access", included: true },
    ],
    buttonText: "Contact Sales",
  },
];

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

export default function PlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Placeholder for actual checkout/registration logic
    console.log(`Selected plan: ${planId}`);
  };

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
              Start with a 14-day free trial. No credit card required. Upgrade
              anytime to unlock more features.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch mb-16">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                {...plan}
                onSelect={() => handleSelectPlan(plan.id)}
                delay={index * 0.1}
              />
            ))}
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
