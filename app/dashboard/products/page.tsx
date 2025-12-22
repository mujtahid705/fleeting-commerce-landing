"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageCard from "@/components/dashboard/PageCard";
import Button from "@/components/ui/Button";

const products = [
  {
    id: 1,
    name: "Premium Headphones",
    category: "Electronics",
    price: "$99.00",
    stock: 45,
    status: "Active",
  },
  {
    id: 2,
    name: "Wireless Keyboard",
    category: "Electronics",
    price: "$59.00",
    stock: 120,
    status: "Active",
  },
  {
    id: 3,
    name: "Smart Watch Pro",
    category: "Wearables",
    price: "$299.00",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: 4,
    name: "USB-C Hub",
    category: "Accessories",
    price: "$49.00",
    stock: 78,
    status: "Active",
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    category: "Electronics",
    price: "$79.00",
    stock: 32,
    status: "Active",
  },
  {
    id: 6,
    name: "Phone Case",
    category: "Accessories",
    price: "$19.00",
    stock: 200,
    status: "Active",
  },
  {
    id: 7,
    name: "Laptop Stand",
    category: "Accessories",
    price: "$89.00",
    stock: 15,
    status: "Low Stock",
  },
  {
    id: 8,
    name: "Webcam HD",
    category: "Electronics",
    price: "$129.00",
    stock: 8,
    status: "Low Stock",
  },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell title="Products" subtitle="Manage your product catalog">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search products..."
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
            <Plus size={18} />
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <PageCard
            key={product.id}
            className="hover:shadow-md transition-shadow"
          >
            {/* Product Image Placeholder */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted">{product.category}</p>
                </div>
                <div className="relative group">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreVertical size={16} className="text-muted" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors rounded-t-xl">
                      <Eye size={14} /> View
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors">
                      <Edit size={14} /> Edit
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-foreground">
                  {product.price}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : product.status === "Low Stock"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <p className="text-sm text-muted">{product.stock} in stock</p>
            </div>
          </PageCard>
        ))}
      </div>
    </DashboardShell>
  );
}
