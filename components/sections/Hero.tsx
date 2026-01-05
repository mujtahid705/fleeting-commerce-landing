"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import Container from "../ui/Container";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Container className="pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={16} />
              <span className="text-sm font-medium">Launch in 5 Minutes</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Dream Store,{" "}
              <span className="gradient-text">Live in Minutes</span>
            </h1>

            <p className="text-lg text-muted mb-8 max-w-xl mx-auto lg:mx-0">
              Skip the complexity. Build a stunning, fully-functional e-commerce
              store without writing a single line of code. Join 10,000+
              entrepreneurs who chose the faster path.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="group inline-flex items-center">
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="group inline-flex items-center"
              >
                <Play className="mr-2 w-5 h-5" />
                <span>Watch Demo</span>
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-8 mt-12 justify-center lg:justify-start"
            >
              <div>
                <p className="text-3xl font-bold text-foreground">10K+</p>
                <p className="text-muted text-sm">Active Stores</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">$50M+</p>
                <p className="text-muted text-sm">Revenue Generated</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">99.9%</p>
                <p className="text-muted text-sm">Uptime</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary" />
                    <div>
                      <p className="font-semibold text-sm">My Awesome Store</p>
                      <p className="text-xs text-muted">mystore.fleeting.com</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    Live
                  </span>
                </div>

                {/* Mini Chart */}
                <div className="h-32 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl flex items-end justify-around p-4 mb-4">
                  {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                      className="w-6 rounded-t-md gradient-primary"
                    />
                  ))}
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted">Today&apos;s Revenue</p>
                    <p className="font-bold text-xl">$2,847</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted">Orders</p>
                    <p className="font-bold text-xl">47</p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted">New Order</p>
                    <p className="font-semibold text-sm">+$127.00</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="absolute -right-4 bottom-1/4 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <p className="font-semibold text-sm">Store Live!</p>
                    <p className="text-xs text-muted">Ready to sell</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
