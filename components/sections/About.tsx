"use client";

import { motion } from "framer-motion";
import {
  Palette,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Globe,
  Shield,
} from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const features = [
  {
    icon: Palette,
    title: "Beautiful Templates",
    description:
      "Choose from 50+ professionally designed templates that convert visitors into customers.",
  },
  {
    icon: ShoppingCart,
    title: "Easy Product Management",
    description:
      "Add, edit, and organize your products with our intuitive drag-and-drop interface.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Accept payments globally with Stripe, PayPal, and 100+ payment gateways.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Track sales, visitor behavior, and revenue with real-time dashboards.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Sell worldwide with multi-currency support and automatic tax calculations.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SSL certificates, PCI compliance, and 24/7 monitoring keep your store safe.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function About() {
  return (
    <section id="about" className="section-padding bg-white">
      <Container>
        <SectionHeading
          title="Everything You Need to Succeed"
          subtitle="Fleeting Commerce gives you all the tools to build, launch, and grow your online business without any technical expertise."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group p-6 rounded-2xl bg-secondary/50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted mb-4">
            Trusted by entrepreneurs and businesses worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {["TechCrunch", "Forbes", "Wired", "Bloomberg", "Inc."].map(
              (brand) => (
                <span key={brand} className="text-xl font-bold text-muted">
                  {brand}
                </span>
              )
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
