"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingCart, TrendingUp, Users, Package } from "lucide-react";

import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import RangeSelector from "@/components/dashboard/RangeSelector";
import RevenueLineChart from "@/components/dashboard/RevenueLineChart";
import OrderStatusDonut from "@/components/dashboard/OrderStatusDonut";
import LowStockPanel from "@/components/dashboard/LowStockPanel";
import { KpiSkeleton, ChartSkeleton } from "@/components/dashboard/DashboardSkeletons";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchOrders } from "@/lib/store/slices/ordersSlice";
import { fetchCustomersByTenant } from "@/lib/store/slices/customersSlice";
import { fetchLowStock } from "@/lib/store/slices/inventorySlice";
import { DashboardRange, RevenueSeries, OrderStatusCount } from "@/lib/types/dashboard";
import { Order, OrderStatus } from "@/lib/types/orders";

// ─── helpers ────────────────────────────────────────────────────────────────

const RANGE_DAYS: Record<DashboardRange, number> = { "7d": 7, "30d": 30, "90d": 90 };
const PAGE_LOAD_TS = Date.now();

function deltaPct(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function formatKpi(value: number, isCurrency = false): string {
  if (isCurrency) return `৳${value.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  return value.toLocaleString("en-US");
}

function formatDelta(pct: number | null): {
  label: string;
  type: "positive" | "negative" | "neutral";
} {
  if (pct === null) return { label: "No prior data", type: "neutral" };
  const sign = pct >= 0 ? "+" : "";
  return {
    label: `${sign}${pct.toFixed(1)}% vs prev period`,
    type: pct > 0 ? "positive" : pct < 0 ? "negative" : "neutral",
  };
}

const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

// ─── order table columns ─────────────────────────────────────────────────────

const orderColumns = [
  { key: "id", header: "Order ID" },
  {
    key: "user",
    header: "Customer",
    render: (item: Order) => item.user?.name ?? "—",
  },
  {
    key: "totalAmount",
    header: "Amount",
    render: (item: Order) =>
      `৳${item.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
  },
  {
    key: "status",
    header: "Status",
    render: (item: Order) => (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
          STATUS_BADGE[item.status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {item.status}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Date",
    render: (item: Order) =>
      new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const [range, setRange] = useState<DashboardRange>("30d");

  const { orders, isLoading: ordersLoading } = useAppSelector((s) => s.orders);
  const { customers, isLoading: customersLoading } = useAppSelector((s) => s.customers);
  const { items: lowStockItems, isLoading: inventoryLoading } = useAppSelector(
    (s) => s.inventory
  );

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchCustomersByTenant());
    dispatch(fetchLowStock(10));
  }, [dispatch]);

  const isLoading = ordersLoading || customersLoading || inventoryLoading;
  const hasData = orders.length > 0 || customers.length > 0;
  const initialLoad = isLoading && !hasData;

  // ── derived analytics ──────────────────────────────────────────────────────

  const analytics = useMemo(() => {
    const now = PAGE_LOAD_TS;
    const days = RANGE_DAYS[range];
    const currStart = now - days * 86400_000;
    const prevStart = now - days * 2 * 86400_000;

    const inCurr = (d: string) => {
      const t = new Date(d).getTime();
      return t >= currStart && t <= now;
    };
    const inPrev = (d: string) => {
      const t = new Date(d).getTime();
      return t >= prevStart && t < currStart;
    };

    const currOrders = orders.filter((o) => inCurr(o.createdAt));
    const prevOrders = orders.filter((o) => inPrev(o.createdAt));

    const activeOrders = (arr: Order[]) => arr.filter((o) => o.status !== "cancelled");

    const currRevenue = activeOrders(currOrders).reduce((s, o) => s + o.totalAmount, 0);
    const prevRevenue = activeOrders(prevOrders).reduce((s, o) => s + o.totalAmount, 0);
    const currOrderCount = activeOrders(currOrders).length;
    const prevOrderCount = activeOrders(prevOrders).length;
    const currAov = currOrderCount > 0 ? currRevenue / currOrderCount : 0;
    const prevAov = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0;

    const currNewCustomers = customers.filter((c) => inCurr(c.createdAt)).length;
    const prevNewCustomers = customers.filter((c) => inPrev(c.createdAt)).length;

    // Revenue series
    const bucketSize = range === "90d" ? 3 : 1;
    const series: RevenueSeries[] = [];
    for (let i = days - 1; i >= 0; i -= bucketSize) {
      const bucketEndTs = now - i * 86400_000;
      const bucketStartTs = bucketEndTs - bucketSize * 86400_000;
      const bucketOrders = orders.filter((o) => {
        if (o.status === "cancelled") return false;
        const t = new Date(o.createdAt).getTime();
        return t >= bucketStartTs && t <= bucketEndTs;
      });
      series.push({
        date: new Date(bucketStartTs).toISOString().slice(0, 10),
        revenue: bucketOrders.reduce((s, o) => s + o.totalAmount, 0),
        orders: bucketOrders.length,
      });
    }

    // Orders by status
    const statusCounts: Record<string, number> = {};
    currOrders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    });
    const ordersByStatus: OrderStatusCount[] = ALL_STATUSES.map((s) => ({
      status: s,
      count: statusCounts[s] ?? 0,
    }));

    // Top products
    const productMap: Record<
      string,
      { productId: string; title: string; unitsSold: number; revenue: number }
    > = {};
    currOrders
      .filter(
        (o) =>
          o.status === "delivered" ||
          o.status === "shipped" ||
          o.status === "processing"
      )
      .forEach((o) => {
        o.order_items?.forEach((item) => {
          const id = item.productId;
          if (!productMap[id]) {
            productMap[id] = {
              productId: id,
              title: item.product?.title ?? id,
              unitsSold: 0,
              revenue: 0,
            };
          }
          productMap[id].unitsSold += item.quantity;
          productMap[id].revenue += item.quantity * item.unitPrice;
        });
      });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders (latest 5 regardless of range)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      currRevenue,
      prevRevenue,
      currOrderCount,
      prevOrderCount,
      currAov,
      prevAov,
      currNewCustomers,
      prevNewCustomers,
      revenueSeries: series,
      ordersByStatus,
      topProducts,
      recentOrders,
    };
  }, [orders, customers, range]);

  const {
    currRevenue,
    prevRevenue,
    currOrderCount,
    prevOrderCount,
    currAov,
    prevAov,
    currNewCustomers,
    prevNewCustomers,
    revenueSeries,
    ordersByStatus,
    topProducts,
    recentOrders,
  } = analytics;

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Store analytics and performance overview"
        action={
          <RangeSelector value={range} onChange={setRange} disabled={isLoading} />
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {initialLoad ? (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatKpi(currRevenue, true)}
              change={formatDelta(deltaPct(currRevenue, prevRevenue)).label}
              changeType={formatDelta(deltaPct(currRevenue, prevRevenue)).type}
              icon={DollarSign}
              iconColor="from-green-500 to-emerald-500"
              delay={0}
            />
            <StatCard
              title="Total Orders"
              value={formatKpi(currOrderCount)}
              change={formatDelta(deltaPct(currOrderCount, prevOrderCount)).label}
              changeType={formatDelta(deltaPct(currOrderCount, prevOrderCount)).type}
              icon={ShoppingCart}
              iconColor="from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Avg. Order Value"
              value={formatKpi(Math.round(currAov), true)}
              change={formatDelta(deltaPct(currAov, prevAov)).label}
              changeType={formatDelta(deltaPct(currAov, prevAov)).type}
              icon={TrendingUp}
              iconColor="from-purple-500 to-pink-500"
              delay={0.2}
            />
            <StatCard
              title="New Customers"
              value={formatKpi(currNewCustomers)}
              change={formatDelta(deltaPct(currNewCustomers, prevNewCustomers)).label}
              changeType={formatDelta(deltaPct(currNewCustomers, prevNewCustomers)).type}
              icon={Users}
              iconColor="from-orange-500 to-red-500"
              delay={0.3}
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PageCard title="Revenue Over Time" className="lg:col-span-2">
          {initialLoad ? (
            <ChartSkeleton height={256} />
          ) : (
            <RevenueLineChart data={revenueSeries} />
          )}
        </PageCard>

        <PageCard title="Orders by Status">
          {initialLoad ? (
            <ChartSkeleton height={220} />
          ) : (
            <OrderStatusDonut data={ordersByStatus} />
          )}
        </PageCard>
      </div>

      {/* Alerts + Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PageCard title="Inventory Alerts">
          {inventoryLoading && !lowStockItems.length ? (
            <ChartSkeleton height={180} />
          ) : (
            <LowStockPanel items={lowStockItems} />
          )}
        </PageCard>

        <PageCard title="Top Products" className="lg:col-span-2">
          {initialLoad ? (
            <ChartSkeleton height={180} />
          ) : !topProducts.length ? (
            <div className="flex items-center justify-center h-32 text-muted text-sm">
              No sales data yet
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-muted flex items-center gap-1">
                        <Package size={11} />
                        {product.unitsSold} sold
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground ml-4 shrink-0">
                    ৳{product.revenue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      </div>

      {/* Recent Orders */}
      <PageCard
        title="Recent Orders"
        action={
          <Link
            href="/dashboard/orders"
            className="text-sm text-primary font-medium hover:text-primary-dark transition-colors"
          >
            View all
          </Link>
        }
        noPadding
      >
        {initialLoad ? (
          <div className="p-6">
            <ChartSkeleton height={160} />
          </div>
        ) : !recentOrders.length ? (
          <div className="p-8 text-center text-muted text-sm">No orders yet</div>
        ) : (
          <DataTable columns={orderColumns} data={recentOrders} />
        )}
      </PageCard>
    </>
  );
}
