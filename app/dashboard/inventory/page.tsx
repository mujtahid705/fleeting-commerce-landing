"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  AlertTriangle,
  Package,
  ArrowUpDown,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import DataTable from "@/components/dashboard/DataTable";
import StatCard from "@/components/dashboard/StatCard";

const inventory = [
  {
    id: 1,
    sku: "SKU001",
    name: "Premium Headphones",
    stock: 45,
    reorderLevel: 20,
    warehouse: "Main",
    lastUpdated: "Dec 22, 2025",
  },
  {
    id: 2,
    sku: "SKU002",
    name: "Wireless Keyboard",
    stock: 120,
    reorderLevel: 30,
    warehouse: "Main",
    lastUpdated: "Dec 22, 2025",
  },
  {
    id: 3,
    sku: "SKU003",
    name: "Smart Watch Pro",
    stock: 0,
    reorderLevel: 15,
    warehouse: "Secondary",
    lastUpdated: "Dec 21, 2025",
  },
  {
    id: 4,
    sku: "SKU004",
    name: "USB-C Hub",
    stock: 78,
    reorderLevel: 25,
    warehouse: "Main",
    lastUpdated: "Dec 21, 2025",
  },
  {
    id: 5,
    sku: "SKU005",
    name: "Bluetooth Speaker",
    stock: 32,
    reorderLevel: 40,
    warehouse: "Main",
    lastUpdated: "Dec 20, 2025",
  },
  {
    id: 6,
    sku: "SKU006",
    name: "Phone Case",
    stock: 200,
    reorderLevel: 50,
    warehouse: "Secondary",
    lastUpdated: "Dec 20, 2025",
  },
  {
    id: 7,
    sku: "SKU007",
    name: "Laptop Stand",
    stock: 15,
    reorderLevel: 20,
    warehouse: "Main",
    lastUpdated: "Dec 19, 2025",
  },
  {
    id: 8,
    sku: "SKU008",
    name: "Webcam HD",
    stock: 8,
    reorderLevel: 10,
    warehouse: "Main",
    lastUpdated: "Dec 19, 2025",
  },
];

const columns = [
  { key: "sku", header: "SKU" },
  { key: "name", header: "Product Name" },
  {
    key: "stock",
    header: "Stock Level",
    render: (item: (typeof inventory)[0]) => (
      <div className="flex items-center gap-2">
        <span
          className={
            item.stock < item.reorderLevel ? "text-red-600 font-medium" : ""
          }
        >
          {item.stock}
        </span>
        {item.stock < item.reorderLevel && (
          <AlertTriangle size={14} className="text-red-500" />
        )}
      </div>
    ),
  },
  { key: "reorderLevel", header: "Reorder Level" },
  { key: "warehouse", header: "Warehouse" },
  { key: "lastUpdated", header: "Last Updated" },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventory.filter(
    (item) => item.stock < item.reorderLevel
  ).length;
  const outOfStockCount = inventory.filter((item) => item.stock === 0).length;
  const totalItems = inventory.reduce((acc, item) => acc + item.stock, 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle="Track and manage your stock levels"
      />
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Items"
          value={totalItems.toLocaleString()}
          icon={Package}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Products Tracked"
          value={inventory.length.toString()}
          icon={ArrowUpDown}
          iconColor="from-purple-500 to-pink-500"
          delay={0.1}
        />
        <StatCard
          title="Low Stock Alerts"
          value={lowStockCount.toString()}
          change="Needs attention"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.2}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount.toString()}
          change="Critical"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="from-red-500 to-pink-500"
          delay={0.3}
        />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <button className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* Inventory Table */}
      <PageCard noPadding>
        <DataTable
          columns={columns}
          data={filteredInventory}
          emptyMessage="No inventory items found"
        />
      </PageCard>
    </>
  );
}
