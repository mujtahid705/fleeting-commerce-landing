import { Order, OrderStatus } from "./orders";

export type DashboardRange = "7d" | "30d" | "90d";

export interface KpiMetric {
  value: number;
  deltaPct: number | null;
  currency?: string;
}

export interface RevenueSeries {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

export interface TopProduct {
  productId: string;
  title: string;
  unitsSold: number;
  revenue: number;
}

export interface LowStockItem {
  productId: string;
  title: string;
  stock: number;
  threshold: number;
}

export interface OverviewResponse {
  range: DashboardRange;
  generatedAt: string;
  kpis: {
    revenue: KpiMetric;
    orders: KpiMetric;
    aov: KpiMetric;
    newCustomers: KpiMetric;
  };
  revenueSeries: RevenueSeries[];
  ordersByStatus: OrderStatusCount[];
  topProducts: TopProduct[];
  lowStock: LowStockItem[];
  recentOrders: Order[];
}

export interface DashboardState {
  overview: OverviewResponse | null;
  range: DashboardRange;
  isLoading: boolean;
  error: string | null;
}
