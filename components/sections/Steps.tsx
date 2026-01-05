"use client";

import { motion } from "framer-motion";
import { UserPlus, CreditCard, Palette, Rocket } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in seconds with your email or social accounts. No credit card required to get started.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Choose Your Plan",
    description:
      "Select the plan that fits your business. Start free and scale as you grow.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: Palette,
    title: "Setup Your Brand",
    description:
      "Customize your store with your logo, colors, and products. Make it uniquely yours.",
    color: "from-orange-500 to-red-500",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Publish Your Site",
    description:
      "Hit publish and your store goes live instantly. Start selling to customers worldwide.",
    color: "from-green-500 to-emerald-500",
  },
];

export default function Steps() {
  return (
    <section
      id="steps"
      className="section-padding bg-gradient-to-b from-white to-secondary/30"
    >
      <Container>
        <SectionHeading
          title="Launch Your Store in 4 Simple Steps"
          subtitle="From idea to live store in under 5 minutes. It's that simple."
        />

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-y-1/2 z-0" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full">
                  {/* Step Number */}
                  <div
                    className={`absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-sm font-bold`}
                  >
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 mt-2`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {step.title}
                  </h3>

                  <p className="text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                    <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                      <span className="text-primary font-bold">→</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Time Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex justify-center"
        >
          <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full">
            <span className="text-4xl">⚡</span>
            <div>
              <p className="font-bold text-primary text-lg">
                Average Setup Time
              </p>
              <p className="text-muted text-sm">
                Just 5 minutes from start to finish
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
