"use client";

import { useState, useEffect } from "react";
import { Package, Check, Search } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { InventoryItem } from "@/lib/types/inventory";
import { Product } from "@/lib/types/products";

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InventoryFormData) => void;
  item?: InventoryItem | null;
  products: Product[];
  existingProductIds: string[];
  isLoading?: boolean;
}

export interface InventoryFormData {
  productId: string;
  quantity: number;
}

export default function InventoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  products,
  existingProductIds,
  isLoading,
}: InventoryFormModalProps) {
  const [formData, setFormData] = useState<InventoryFormData>({
    productId: "",
    quantity: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productSearch, setProductSearch] = useState("");

  const isEditMode = !!item;

  // Available products (not in inventory already)
  const availableProducts = products.filter(
    (p) => !existingProductIds.includes(p.id) || p.id === item?.productId
  );

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setFormData({
        productId: item.productId,
        quantity: item.quantity,
      });
    } else {
      setFormData({
        productId: "",
        quantity: 0,
      });
    }
    setErrors({});
    setProductSearch("");
  }, [isOpen, item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || 0 : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId) {
      newErrors.productId = "Please select a product";
    }
    if (formData.quantity < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }
    if (!isEditMode && formData.quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Update Inventory" : "Add to Inventory"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Product
          </label>
          {isEditMode ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item?.product?.images?.[0]?.imageUrl ? (
                  <img
                    src={item.product.images[0].imageUrl}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={20} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {item?.product?.title || "Product"}
                </p>
                <p className="text-xs text-muted">
                  {item?.product?.price != null
                    ? `৳${item.product.price.toLocaleString()}`
                    : `ID: ${item?.productId}`}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative mb-2">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              {/* Card grid */}
              <div
                className={`grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5 rounded-xl border ${
                  errors.productId ? "border-red-400" : "border-gray-200"
                } p-2 bg-gray-50`}
              >
                {availableProducts
                  .filter((p) =>
                    p.title.toLowerCase().includes(productSearch.toLowerCase())
                  )
                  .map((product) => {
                    const selected = formData.productId === product.id;
                    const img = product.images?.[0]?.imageUrl;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, productId: product.id }));
                          if (errors.productId)
                            setErrors((prev) => ({ ...prev, productId: "" }));
                        }}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                            : "border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {img ? (
                            <img src={img} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate leading-tight">
                            {product.title}
                          </p>
                          <p className="text-xs text-muted">৳{product.price.toLocaleString()}</p>
                          {product.category?.name && (
                            <p className="text-[10px] text-muted/70 truncate">{product.category.name}</p>
                          )}
                        </div>
                        {selected && (
                          <Check size={14} className="text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                {availableProducts.filter((p) =>
                  p.title.toLowerCase().includes(productSearch.toLowerCase())
                ).length === 0 && (
                  <p className="col-span-2 text-center text-xs text-muted py-4">
                    {availableProducts.length === 0
                      ? products.length === 0
                        ? "No products available. Create products first."
                        : "All products are already in inventory."
                      : "No products match your search."}
                  </p>
                )}
              </div>
            </>
          )}
          {errors.productId && (
            <p className="text-red-500 text-xs mt-1">{errors.productId}</p>
          )}
        </div>

        {/* Quantity */}
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="0"
          value={formData.quantity.toString()}
          onChange={handleChange}
          placeholder="Enter quantity"
          error={errors.quantity}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            isLoading={isLoading}
            disabled={!isEditMode && availableProducts.length === 0}
          >
            {isEditMode ? "Update" : "Add to Inventory"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
