"use client";

import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";

// Sample data
const recentOrders = [
  {
    id: "ORD001",
    customer: "Sarah Johnson",
    amount: "$250.00",
    status: "Completed",
    date: "Dec 22, 2025",
  },
  {
    id: "ORD002",
    customer: "Mike Chen",
    amount: "$189.50",
    status: "Processing",
    date: "Dec 22, 2025",
  },
  {
    id: "ORD003",
    customer: "Emily Davis",
    amount: "$420.00",
    status: "Pending",
    date: "Dec 21, 2025",
  },
  {
    id: "ORD004",
    customer: "James Wilson",
    amount: "$95.00",
    status: "Completed",
    date: "Dec 21, 2025",
  },
  {
    id: "ORD005",
    customer: "Lisa Brown",
    amount: "$320.75",
    status: "Shipped",
    date: "Dec 20, 2025",
  },
];

const topProducts = [
  { id: 1, name: "Premium Headphones", sales: 234, revenue: "$11,700" },
  { id: 2, name: "Wireless Keyboard", sales: 189, revenue: "$5,670" },
  { id: 3, name: "Smart Watch Pro", sales: 156, revenue: "$23,400" },
  { id: 4, name: "USB-C Hub", sales: 142, revenue: "$4,260" },
];

const orderColumns = [
  { key: "id", header: "Order ID" },
  { key: "customer", header: "Customer" },
  { key: "amount", header: "Amount" },
  {
    key: "status",
    header: "Status",
    render: (item: (typeof recentOrders)[0]) => (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          item.status === "Completed"
            ? "bg-green-100 text-green-700"
            : item.status === "Processing"
            ? "bg-blue-100 text-blue-700"
            : item.status === "Shipped"
            ? "bg-purple-100 text-purple-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {item.status}
      </span>
    ),
  },
  { key: "date", header: "Date" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your store."
      />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$45,231"
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="from-green-500 to-emerald-500"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value="1,234"
          change="+8.2% from last month"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Products Sold"
          value="2,847"
          change="-2.4% from last month"
          changeType="negative"
          icon={Package}
          iconColor="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="New Customers"
          value="321"
          change="+18.7% from last month"
          changeType="positive"
          icon={Users}
          iconColor="from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Charts & Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart Placeholder */}
        <PageCard title="Revenue Overview" className="lg:col-span-2">
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto text-primary mb-3" />
              <p className="text-muted">Revenue chart will be displayed here</p>
            </div>
          </div>
        </PageCard>

        {/* Top Products */}
        <PageCard title="Top Products">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted">{product.sales} sales</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">
                  {product.revenue}
                </span>
              </div>
            ))}
          </div>
        </PageCard>
      </div>

      {/* Recent Orders */}
      <PageCard
        title="Recent Orders"
        action={
          <button className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
            View all
          </button>
        }
        noPadding
      >
        <DataTable columns={orderColumns} data={recentOrders} />
      </PageCard>
    </>
  );
}
