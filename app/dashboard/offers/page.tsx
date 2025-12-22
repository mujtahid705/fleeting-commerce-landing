"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Tag,
  Percent,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageCard from "@/components/dashboard/PageCard";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";

const offers = [
  {
    id: 1,
    name: "Holiday Sale",
    code: "HOLIDAY25",
    discount: "25%",
    type: "Percentage",
    usageCount: 156,
    usageLimit: 500,
    status: "Active",
    expires: "Dec 31, 2025",
  },
  {
    id: 2,
    name: "New Customer",
    code: "WELCOME10",
    discount: "10%",
    type: "Percentage",
    usageCount: 89,
    usageLimit: null,
    status: "Active",
    expires: "Jan 15, 2026",
  },
  {
    id: 3,
    name: "Free Shipping",
    code: "FREESHIP",
    discount: "$0 shipping",
    type: "Shipping",
    usageCount: 234,
    usageLimit: 1000,
    status: "Active",
    expires: "Dec 25, 2025",
  },
  {
    id: 4,
    name: "Flash Sale",
    code: "FLASH50",
    discount: "50%",
    type: "Percentage",
    usageCount: 500,
    usageLimit: 500,
    status: "Expired",
    expires: "Dec 15, 2025",
  },
  {
    id: 5,
    name: "Loyalty Discount",
    code: "LOYAL15",
    discount: "$15 off",
    type: "Fixed",
    usageCount: 67,
    usageLimit: 200,
    status: "Active",
    expires: "Feb 28, 2026",
  },
  {
    id: 6,
    name: "Bundle Deal",
    code: "BUNDLE20",
    discount: "20%",
    type: "Percentage",
    usageCount: 0,
    usageLimit: 100,
    status: "Scheduled",
    expires: "Jan 01, 2026",
  },
];

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOffers = offers.filter(
    (offer) =>
      offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeOffers = offers.filter((o) => o.status === "Active").length;
  const totalUsage = offers.reduce((acc, o) => acc + o.usageCount, 0);

  return (
    <DashboardShell
      title="Offers & Discounts"
      subtitle="Create and manage promotional offers"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Offers"
          value={offers.length.toString()}
          icon={Tag}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Active Offers"
          value={activeOffers.toString()}
          icon={Percent}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Total Redemptions"
          value={totalUsage.toLocaleString()}
          change="+24% this month"
          changeType="positive"
          icon={Tag}
          iconColor="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Expiring Soon"
          value="2"
          change="Within 7 days"
          changeType="neutral"
          icon={Calendar}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.3}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search offers or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus size={18} />
          Create Offer
        </Button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => (
          <PageCard
            key={offer.id}
            className="hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{offer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-primary">
                    {offer.code}
                  </code>
                  <button
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Copy code"
                  >
                    <Copy size={14} className="text-muted" />
                  </button>
                </div>
              </div>
              <div className="relative group">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <MoreVertical size={16} className="text-muted" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors rounded-t-xl">
                    <Edit size={14} /> Edit
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Discount Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full mb-4">
              <Percent size={14} />
              <span className="font-semibold text-sm">{offer.discount}</span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Type</span>
                <span className="font-medium text-foreground">
                  {offer.type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Usage</span>
                <span className="font-medium text-foreground">
                  {offer.usageCount}
                  {offer.usageLimit ? ` / ${offer.usageLimit}` : " (Unlimited)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Expires</span>
                <span className="font-medium text-foreground">
                  {offer.expires}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  offer.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : offer.status === "Scheduled"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {offer.status}
              </span>
            </div>
          </PageCard>
        ))}
      </div>
    </DashboardShell>
  );
}
