"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  DollarSign,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";

const payments = [
  {
    id: "PAY001",
    orderId: "ORD001",
    customer: "Sarah Johnson",
    amount: "$250.00",
    method: "Credit Card",
    status: "Completed",
    date: "Dec 22, 2025",
  },
  {
    id: "PAY002",
    orderId: "ORD002",
    customer: "Mike Chen",
    amount: "$189.50",
    method: "PayPal",
    status: "Completed",
    date: "Dec 22, 2025",
  },
  {
    id: "PAY003",
    orderId: "ORD003",
    customer: "Emily Davis",
    amount: "$420.00",
    method: "Credit Card",
    status: "Pending",
    date: "Dec 21, 2025",
  },
  {
    id: "PAY004",
    orderId: "ORD004",
    customer: "James Wilson",
    amount: "$95.00",
    method: "Debit Card",
    status: "Completed",
    date: "Dec 21, 2025",
  },
  {
    id: "PAY005",
    orderId: "ORD005",
    customer: "Lisa Brown",
    amount: "$320.75",
    method: "Credit Card",
    status: "Completed",
    date: "Dec 20, 2025",
  },
  {
    id: "PAY006",
    orderId: "ORD006",
    customer: "David Lee",
    amount: "$158.00",
    method: "PayPal",
    status: "Processing",
    date: "Dec 20, 2025",
  },
  {
    id: "PAY007",
    orderId: "ORD007",
    customer: "Anna Smith",
    amount: "$890.00",
    method: "Credit Card",
    status: "Completed",
    date: "Dec 19, 2025",
  },
  {
    id: "PAY008",
    orderId: "ORD008",
    customer: "Tom Harris",
    amount: "$45.00",
    method: "Debit Card",
    status: "Failed",
    date: "Dec 19, 2025",
  },
];

const columns = [
  { key: "id", header: "Payment ID" },
  { key: "orderId", header: "Order ID" },
  { key: "customer", header: "Customer" },
  { key: "amount", header: "Amount" },
  {
    key: "method",
    header: "Method",
    render: (item: (typeof payments)[0]) => (
      <div className="flex items-center gap-2">
        <CreditCard size={14} className="text-muted" />
        <span>{item.method}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item: (typeof payments)[0]) => {
      const statusStyles: Record<
        string,
        { bg: string; icon: typeof CheckCircle }
      > = {
        Completed: { bg: "bg-green-100 text-green-700", icon: CheckCircle },
        Pending: { bg: "bg-yellow-100 text-yellow-700", icon: Clock },
        Processing: { bg: "bg-blue-100 text-blue-700", icon: Clock },
        Failed: { bg: "bg-red-100 text-red-700", icon: XCircle },
      };
      const style = statusStyles[item.status];
      const Icon = style.icon;
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg}`}
        >
          <Icon size={12} />
          {item.status}
        </span>
      );
    },
  },
  { key: "date", header: "Date" },
];

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || payment.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = payments.reduce(
    (acc, p) => acc + parseFloat(p.amount.replace(/[$,]/g, "")),
    0
  );
  const completedAmount = payments
    .filter((p) => p.status === "Completed")
    .reduce((acc, p) => acc + parseFloat(p.amount.replace(/[$,]/g, "")), 0);
  const pendingCount = payments.filter(
    (p) => p.status === "Pending" || p.status === "Processing"
  ).length;
  const failedCount = payments.filter((p) => p.status === "Failed").length;

  return (
    <DashboardShell
      title="Payments"
      subtitle="Track and manage all payment transactions"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Transactions"
          value={payments.length.toString()}
          icon={CreditCard}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Revenue Collected"
          value={`$${completedAmount.toLocaleString()}`}
          change="+12.5% this month"
          changeType="positive"
          icon={DollarSign}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Pending Payments"
          value={pendingCount.toString()}
          icon={Clock}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.2}
        />
        <StatCard
          title="Failed Payments"
          value={failedCount.toString()}
          change="Needs review"
          changeType="negative"
          icon={XCircle}
          iconColor="from-red-500 to-pink-500"
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
            placeholder="Search by payment ID or customer..."
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
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <PageCard noPadding>
        <DataTable
          columns={columns}
          data={filteredPayments}
          emptyMessage="No payments found"
        />
      </PageCard>
    </DashboardShell>
  );
}
