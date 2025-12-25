"use client";

import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import StatCard from "@/components/dashboard/StatCard";

const topProducts = [
  { name: "Premium Headphones", sales: 234, revenue: "$11,700", growth: 15 },
  { name: "Smart Watch Pro", sales: 189, revenue: "$56,700", growth: 22 },
  { name: "Wireless Keyboard", sales: 156, revenue: "$4,680", growth: -5 },
  { name: "USB-C Hub", sales: 142, revenue: "$4,260", growth: 8 },
  { name: "Bluetooth Speaker", sales: 128, revenue: "$10,240", growth: 12 },
];

const trafficSources = [
  { source: "Direct", visitors: 4521, percentage: 35 },
  { source: "Organic Search", visitors: 3210, percentage: 25 },
  { source: "Social Media", visitors: 2580, percentage: 20 },
  { source: "Referral", visitors: 1548, percentage: 12 },
  { source: "Email", visitors: 1032, percentage: 8 },
];

const recentActivity = [
  {
    action: "New order received",
    detail: "Order #ORD089 - $245.00",
    time: "2 min ago",
  },
  {
    action: "Customer signed up",
    detail: "john.doe@email.com",
    time: "15 min ago",
  },
  {
    action: "Product reviewed",
    detail: "Premium Headphones - 5 stars",
    time: "1 hour ago",
  },
  {
    action: "Refund processed",
    detail: "Order #ORD076 - $89.00",
    time: "2 hours ago",
  },
  {
    action: "New order received",
    detail: "Order #ORD088 - $512.00",
    time: "3 hours ago",
  },
];

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Insights and performance metrics for your store"
      />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value="$124,592"
          change="+18.2% vs last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="from-green-500 to-emerald-500"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value="2,847"
          change="+12.5% vs last month"
          changeType="positive"
          icon={ShoppingCart}
          iconColor="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <StatCard
          title="Total Visitors"
          value="12,891"
          change="+8.1% vs last month"
          changeType="positive"
          icon={Users}
          iconColor="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          change="-0.5% vs last month"
          changeType="negative"
          icon={TrendingUp}
          iconColor="from-orange-500 to-red-500"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <PageCard title="Revenue Trend">
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <BarChart3 size={48} className="mx-auto text-primary mb-3" />
              <p className="text-muted">Revenue chart visualization</p>
              <p className="text-sm text-muted mt-1">
                Integration with charting library pending
              </p>
            </div>
          </div>
        </PageCard>

        {/* Orders Chart */}
        <PageCard title="Orders Overview">
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
            <div className="text-center">
              <TrendingUp size={48} className="mx-auto text-primary mb-3" />
              <p className="text-muted">Orders chart visualization</p>
              <p className="text-sm text-muted mt-1">
                Integration with charting library pending
              </p>
            </div>
          </div>
        </PageCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <PageCard title="Top Selling Products">
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
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
                <div className="text-right">
                  <p className="font-semibold text-foreground text-sm">
                    {product.revenue}
                  </p>
                  <p
                    className={`text-xs flex items-center justify-end gap-1 ${
                      product.growth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.growth >= 0 ? (
                      <ArrowUp size={12} />
                    ) : (
                      <ArrowDown size={12} />
                    )}
                    {Math.abs(product.growth)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PageCard>

        {/* Traffic Sources */}
        <PageCard title="Traffic Sources">
          <div className="space-y-4">
            {trafficSources.map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {source.source}
                  </span>
                  <span className="text-sm text-muted">
                    {source.visitors.toLocaleString()} ({source.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PageCard>

        {/* Recent Activity */}
        <PageCard title="Recent Activity">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted">{activity.detail}</p>
                  <p className="text-xs text-muted mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </PageCard>
      </div>
    </>
  );
}
