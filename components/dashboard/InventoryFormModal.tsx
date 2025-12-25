"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
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
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <Package size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {item?.product?.title || "Product"}
                </p>
                <p className="text-xs text-muted">ID: {item?.productId}</p>
              </div>
            </div>
          ) : (
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                errors.productId ? "border-red-500" : "border-gray-200"
              } focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm`}
            >
              <option value="">Select a product...</option>
              {availableProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} - ${product.price}
                </option>
              ))}
            </select>
          )}
          {errors.productId && (
            <p className="text-red-500 text-xs mt-1">{errors.productId}</p>
          )}
          {!isEditMode && availableProducts.length === 0 && (
            <p className="text-yellow-600 text-xs mt-1">
              All products are already in inventory
            </p>
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
