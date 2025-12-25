"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";

const orders = [
  {
    id: "ORD001",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    items: 3,
    total: "$250.00",
    status: "Completed",
    date: "Dec 22, 2025",
  },
  {
    id: "ORD002",
    customer: "Mike Chen",
    email: "mike@example.com",
    items: 2,
    total: "$189.50",
    status: "Processing",
    date: "Dec 22, 2025",
  },
  {
    id: "ORD003",
    customer: "Emily Davis",
    email: "emily@example.com",
    items: 5,
    total: "$420.00",
    status: "Pending",
    date: "Dec 21, 2025",
  },
  {
    id: "ORD004",
    customer: "James Wilson",
    email: "james@example.com",
    items: 1,
    total: "$95.00",
    status: "Completed",
    date: "Dec 21, 2025",
  },
  {
    id: "ORD005",
    customer: "Lisa Brown",
    email: "lisa@example.com",
    items: 4,
    total: "$320.75",
    status: "Shipped",
    date: "Dec 20, 2025",
  },
  {
    id: "ORD006",
    customer: "David Lee",
    email: "david@example.com",
    items: 2,
    total: "$158.00",
    status: "Processing",
    date: "Dec 20, 2025",
  },
  {
    id: "ORD007",
    customer: "Anna Smith",
    email: "anna@example.com",
    items: 6,
    total: "$890.00",
    status: "Completed",
    date: "Dec 19, 2025",
  },
  {
    id: "ORD008",
    customer: "Tom Harris",
    email: "tom@example.com",
    items: 1,
    total: "$45.00",
    status: "Cancelled",
    date: "Dec 19, 2025",
  },
];

const columns = [
  { key: "id", header: "Order ID" },
  {
    key: "customer",
    header: "Customer",
    render: (item: (typeof orders)[0]) => (
      <div>
        <p className="font-medium">{item.customer}</p>
        <p className="text-xs text-muted">{item.email}</p>
      </div>
    ),
  },
  { key: "items", header: "Items" },
  { key: "total", header: "Total" },
  {
    key: "status",
    header: "Status",
    render: (item: (typeof orders)[0]) => {
      const statusStyles: Record<string, string> = {
        Completed: "bg-green-100 text-green-700",
        Processing: "bg-blue-100 text-blue-700",
        Pending: "bg-yellow-100 text-yellow-700",
        Shipped: "bg-purple-100 text-purple-700",
        Cancelled: "bg-red-100 text-red-700",
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
  { key: "date", header: "Date" },
  {
    key: "actions",
    header: "",
    render: () => (
      <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Eye size={16} className="text-muted" />
      </button>
    ),
  },
];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const processingCount = orders.filter(
    (o) => o.status === "Processing"
  ).length;
  const completedCount = orders.filter((o) => o.status === "Completed").length;

  return (
    <>
      <PageHeader title="Orders" subtitle="View and manage customer orders" />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={orders.length.toString()}
          icon={ShoppingCart}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Pending"
          value={pendingCount.toString()}
          icon={Clock}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.1}
        />
        <StatCard
          title="Processing"
          value={processingCount.toString()}
          icon={Truck}
          iconColor="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          icon={CheckCircle}
          iconColor="from-green-500 to-emerald-500"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium text-foreground"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <PageCard noPadding>
        <DataTable
          columns={columns}
          data={filteredOrders}
          emptyMessage="No orders found"
        />
      </PageCard>
    </>
  );
}
