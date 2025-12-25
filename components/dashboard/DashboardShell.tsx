"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function DashboardShell({
  children,
  title,
  subtitle,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-[280px] transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu size={24} className="text-foreground" />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <Bell size={20} className="text-muted" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="lg:hidden w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl lg:text-3xl font-bold text-foreground"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted mt-1"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Page Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
