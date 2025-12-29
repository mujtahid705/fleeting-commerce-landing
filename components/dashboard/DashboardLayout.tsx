"use client";

import { useState } from "react";
import { Bell, Menu, Store, ExternalLink } from "lucide-react";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import { useAppSelector } from "@/lib/store/hooks";
import Button from "@/components/ui/Button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { tenant, user } = useAppSelector((state) => state.auth);

  const domain = tenant?.domain || "";
  const storeBaseUrl =
    process.env.NEXT_PUBLIC_STORE_BASE_URL || "http://localhost:3001";
  const urlMatch = storeBaseUrl.match(/^(https?:\/\/)(.+)$/);
  const protocol = urlMatch?.[1] || "http://";
  const baseDomain = urlMatch?.[2] || "localhost:3001";
  const storeUrl = domain ? `${protocol}${domain}.${baseDomain}` : "";

  const handleVisitSite = () => {
    if (storeUrl) {
      window.open(storeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div
        className="transition-all duration-300 max-lg:!pl-0"
        style={{ paddingLeft: sidebarCollapsed ? 80 : 280 }}
      >
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

            {/* Tenant/Store Name */}
            {tenant?.name && (
              <div className="hidden md:flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                  <Store size={18} className="text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {tenant.name}
                  </span>
                </div>
              </div>
            )}

            {/* Show user role if no tenant (for super admin) */}
            {!tenant?.name && user?.role === "SUPER_ADMIN" && (
              <div className="hidden md:flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500/5 to-purple-500/5 border border-violet-500/10">
                  <span className="text-sm font-semibold text-foreground">
                    Super Admin Panel
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {storeUrl && (
                <Button
                  onClick={handleVisitSite}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <span className="hidden sm:inline">Visit Site</span>
                  <ExternalLink size={16} />
                </Button>
              )}
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
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
