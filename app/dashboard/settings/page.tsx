"use client";

import { useState } from "react";
import {
  Store,
  Bell,
  CreditCard,
  Shield,
  Palette,
  Globe,
  Mail,
  Phone,
  User,
  Save,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAppSelector } from "@/lib/store/hooks";

const tabs = [
  { id: "general", label: "General", icon: Store },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "domains", label: "Domains", icon: Globe },
];

function ReadOnlyField({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50">
        {icon && <span className="text-muted shrink-0">{icon}</span>}
        <span className={value ? "text-foreground" : "text-muted italic"}>
          {value || "Not set"}
        </span>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { user, tenant } = useAppSelector((s) => s.auth);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your store preferences and configurations"
      />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <PageCard>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-gray-100 hover:text-foreground"
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </PageCard>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <PageCard title="Store Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField
                      label="Store Name"
                      value={tenant?.name}
                      icon={<Store size={18} />}
                    />
                    <ReadOnlyField
                      label="Store Domain"
                      value={tenant?.domain ? `${tenant.domain}.fleetingcommerce.com` : undefined}
                      icon={<Globe size={18} />}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    To change store name or domain, go to{" "}
                    <a href="/dashboard/brand" className="text-primary hover:underline">
                      Brand Settings
                    </a>
                    .
                  </p>
                </div>
              </PageCard>

              <PageCard title="Account Information">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ReadOnlyField
                      label="Full Name"
                      value={user?.name}
                      icon={<User size={18} />}
                    />
                    <ReadOnlyField
                      label="Email Address"
                      value={user?.email}
                      icon={<Mail size={18} />}
                    />
                  </div>
                  <ReadOnlyField
                    label="Phone Number"
                    value={user?.phone}
                    icon={<Phone size={18} />}
                  />
                  <p className="text-xs text-muted">
                    Contact support to update account details.
                  </p>
                </div>
              </PageCard>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <PageCard title="Notification Preferences">
              <div className="space-y-6">
                {[
                  {
                    label: "New Order Notifications",
                    description: "Get notified when you receive a new order",
                  },
                  {
                    label: "Low Stock Alerts",
                    description: "Receive alerts when products are running low",
                  },
                  {
                    label: "Customer Reviews",
                    description: "Get notified when customers leave reviews",
                  },
                  {
                    label: "Payment Updates",
                    description: "Receive updates about payment status changes",
                  },
                  {
                    label: "Marketing Emails",
                    description:
                      "Receive tips and updates about growing your store",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={index < 3}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save size={18} />
                    Save Preferences
                  </Button>
                </div>
              </div>
            </PageCard>
          )}

          {/* Payment Methods */}
          {activeTab === "payments" && (
            <PageCard title="Payment Methods">
              <div className="space-y-4">
                {[
                  { name: "Stripe", status: "Connected", icon: "💳" },
                  { name: "PayPal", status: "Connected", icon: "🅿️" },
                  { name: "Square", status: "Not Connected", icon: "⬛" },
                ].map((method, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{method.icon}</span>
                      <div>
                        <p className="font-medium text-foreground">
                          {method.name}
                        </p>
                        <p
                          className={`text-sm ${
                            method.status === "Connected"
                              ? "text-green-600"
                              : "text-muted"
                          }`}
                        >
                          {method.status}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        method.status === "Connected" ? "secondary" : "primary"
                      }
                      size="sm"
                    >
                      {method.status === "Connected" ? "Configure" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </PageCard>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <PageCard title="Security Settings">
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3">
                    <Shield className="text-green-600" size={24} />
                    <div>
                      <p className="font-medium text-green-800">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-green-600">
                        Your account is protected with 2FA
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-4">
                    Change Password
                  </h4>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save size={18} />
                    Update Password
                  </Button>
                </div>
              </div>
            </PageCard>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <PageCard title="Store Appearance">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      "#6366f1",
                      "#8b5cf6",
                      "#ec4899",
                      "#10b981",
                      "#f59e0b",
                      "#ef4444",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Store Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {["Modern", "Classic", "Minimal"].map((theme) => (
                      <button
                        key={theme}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme === "Modern"
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3" />
                        <p className="font-medium text-foreground text-sm">
                          {theme}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="flex items-center gap-2">
                    <Save size={18} />
                    Save Theme
                  </Button>
                </div>
              </div>
            </PageCard>
          )}

          {/* Domains */}
          {activeTab === "domains" && (
            <PageCard title="Custom Domains">
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {tenant?.domain
                          ? `${tenant.domain}.fleetingcommerce.com`
                          : "No domain configured"}
                      </p>
                      <p className="text-sm text-muted">Default subdomain</p>
                    </div>
                    {tenant?.domain && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Add Custom Domain
                  </label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="www.yourdomain.com"
                      className="flex-1"
                    />
                    <Button>Add Domain</Button>
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Add a CNAME record pointing to fleetingcommerce.com
                  </p>
                </div>
              </div>
            </PageCard>
          )}
        </div>
      </div>
    </>
  );
}
