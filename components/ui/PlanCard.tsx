"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import Button from "./Button";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  buttonText: string;
  onSelect: () => void;
  badge?: string;
  delay?: number;
}

export default function PlanCard({
  name,
  price,
  period,
  description,
  features,
  popular = false,
  buttonText,
  onSelect,
  badge,
  delay = 0,
}: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative rounded-2xl p-8 h-full flex flex-col ${
        popular
          ? "bg-gradient-to-b from-primary to-primary-dark text-white shadow-2xl shadow-primary/30 scale-105 z-10"
          : "bg-white border border-gray-200 shadow-lg hover:shadow-xl"
      } transition-all duration-300`}
    >
      {/* Badge */}
      {badge && (
        <div
          className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${
            popular ? "bg-white text-primary" : "bg-primary/10 text-primary"
          }`}
        >
          <Sparkles size={14} />
          {badge}
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3
          className={`text-xl font-bold mb-2 ${
            popular ? "text-white" : "text-foreground"
          }`}
        >
          {name}
        </h3>
        <p className={`text-sm ${popular ? "text-white/80" : "text-muted"}`}>
          {description}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl font-bold ${
              popular ? "text-white" : "text-foreground"
            }`}
          >
            {price}
          </span>
          {period && (
            <span
              className={`text-sm ${popular ? "text-white/70" : "text-muted"}`}
            >
              /{period}
            </span>
          )}
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-grow">
        {features.map((feature, index) => (
          <li
            key={index}
            className={`flex items-start gap-3 text-sm ${
              feature.included
                ? popular
                  ? "text-white"
                  : "text-foreground"
                : popular
                ? "text-white/50 line-through"
                : "text-muted line-through"
            }`}
          >
            <Check
              size={18}
              className={`flex-shrink-0 mt-0.5 ${
                feature.included
                  ? popular
                    ? "text-white"
                    : "text-primary"
                  : popular
                  ? "text-white/30"
                  : "text-gray-300"
              }`}
            />
            {feature.text}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        onClick={onSelect}
        variant={popular ? "secondary" : "primary"}
        size="lg"
        className={`w-full ${popular ? "text-primary font-semibold" : ""}`}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}
