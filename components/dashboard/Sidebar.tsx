"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  CreditCard,
  BarChart3,
  Tag,
  Settings,
  ChevronLeft,
  Zap,
  LogOut,
  Route,
  Component,
  Ungroup,
  Shield,
  UserCog,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { logoutUser } from "@/lib/store/slices/authSlice";
import { useToast } from "@/components/ui/Toast";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    access: ["SUPER_ADMIN", "TENANT_ADMIN"],
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Inventory",
    href: "/dashboard/inventory",
    icon: Warehouse,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: Component,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Subcategories",
    href: "/dashboard/subcategories",
    icon: Ungroup,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Customers",
    href: "/dashboard/customers",
    icon: Users,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Users",
    href: "/dashboard/users",
    icon: Users,
    access: ["SUPER_ADMIN"],
  },
  {
    name: "Plans",
    href: "/dashboard/plans",
    icon: Route,
    access: ["SUPER_ADMIN"],
  },
  {
    name: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    access: ["SUPER_ADMIN", "TENANT_ADMIN"],
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    access: ["SUPER_ADMIN", "TENANT_ADMIN"],
  },
  {
    name: "Offers",
    href: "/dashboard/offers",
    icon: Tag,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Team Admins",
    href: "/dashboard/admins",
    icon: UserCog,
    access: ["TENANT_ADMIN"],
  },
  {
    name: "Super Admins",
    href: "/dashboard/super-admins",
    icon: Shield,
    access: ["SUPER_ADMIN"],
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    access: ["SUPER_ADMIN", "TENANT_ADMIN"],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    showToast({
      type: "success",
      title: "Logged out",
      message: "You have been successfully logged out.",
    });
    router.push("/login");
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-foreground whitespace-nowrap"
              >
                Fleeting<span className="text-primary">Commerce</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft size={20} className="text-muted" />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems
            .filter((item) => user?.role && item.access.includes(user.role))
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-muted hover:bg-gray-100 hover:text-foreground"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`flex-shrink-0 ${
                        isActive
                          ? "text-white"
                          : "text-muted group-hover:text-primary"
                      }`}
                    />
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className="font-medium whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-100">
        <div
          className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold flex-shrink-0">
            {userInitials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="font-medium text-foreground text-sm truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted truncate">
                  {user?.email || ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {!collapsed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Logout"
              >
                <LogOut size={18} className="text-muted" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
