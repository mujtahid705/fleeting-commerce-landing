"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Mail,
  UserPlus,
  Users,
  UserCheck,
  ShoppingBag,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";

const customers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    orders: 12,
    spent: "$2,450.00",
    status: "Active",
    joined: "Jan 15, 2025",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@example.com",
    orders: 8,
    spent: "$1,189.50",
    status: "Active",
    joined: "Feb 22, 2025",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@example.com",
    orders: 23,
    spent: "$4,820.00",
    status: "VIP",
    joined: "Mar 10, 2024",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james@example.com",
    orders: 5,
    spent: "$495.00",
    status: "Active",
    joined: "Jun 05, 2025",
  },
  {
    id: 5,
    name: "Lisa Brown",
    email: "lisa@example.com",
    orders: 15,
    spent: "$3,120.75",
    status: "Active",
    joined: "Apr 18, 2025",
  },
  {
    id: 6,
    name: "David Lee",
    email: "david@example.com",
    orders: 2,
    spent: "$158.00",
    status: "New",
    joined: "Dec 10, 2025",
  },
  {
    id: 7,
    name: "Anna Smith",
    email: "anna@example.com",
    orders: 31,
    spent: "$6,890.00",
    status: "VIP",
    joined: "Nov 22, 2024",
  },
  {
    id: 8,
    name: "Tom Harris",
    email: "tom@example.com",
    orders: 0,
    spent: "$0.00",
    status: "Inactive",
    joined: "Sep 15, 2025",
  },
];

const columns = [
  {
    key: "name",
    header: "Customer",
    render: (item: (typeof customers)[0]) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
          {item.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted">{item.email}</p>
        </div>
      </div>
    ),
  },
  { key: "orders", header: "Orders" },
  { key: "spent", header: "Total Spent" },
  {
    key: "status",
    header: "Status",
    render: (item: (typeof customers)[0]) => {
      const statusStyles: Record<string, string> = {
        Active: "bg-green-100 text-green-700",
        VIP: "bg-purple-100 text-purple-700",
        New: "bg-blue-100 text-blue-700",
        Inactive: "bg-gray-100 text-gray-700",
      };
      return (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            statusStyles[item.status]
          }`}
        >
          {item.status}
        </span>
      );
    },
  },
  { key: "joined", header: "Joined" },
  {
    key: "actions",
    header: "",
    render: (item: (typeof customers)[0]) => (
      <button
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title={`Email ${item.name}`}
      >
        <Mail size={16} className="text-muted" />
      </button>
    ),
  },
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(
    (c) => c.status === "Active" || c.status === "VIP"
  ).length;
  const vipCustomers = customers.filter((c) => c.status === "VIP").length;
  const totalRevenue = customers.reduce(
    (acc, c) => acc + parseFloat(c.spent.replace(/[$,]/g, "")),
    0
  );

  return (
    <DashboardShell
      title="Customers"
      subtitle="Manage your customer relationships"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Customers"
          value={totalCustomers.toString()}
          icon={Users}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Active Customers"
          value={activeCustomers.toString()}
          icon={UserCheck}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="VIP Customers"
          value={vipCustomers.toString()}
          icon={UserPlus}
          iconColor="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={ShoppingBag}
          iconColor="from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter size={18} />
            Filter
          </button>
          <Button size="sm" className="flex items-center gap-2">
            <Mail size={18} />
            Email All
          </Button>
        </div>
      </div>

      {/* Customers Table */}
      <PageCard noPadding>
        <DataTable
          columns={columns}
          data={filteredCustomers}
          emptyMessage="No customers found"
        />
      </PageCard>
    </DashboardShell>
  );
}
