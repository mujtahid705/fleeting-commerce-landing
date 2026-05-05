"use client";

import { useState, useEffect, FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  createSaleDiscount,
  updateSaleDiscount,
} from "@/lib/store/slices/offersSlice";
import { useToast } from "@/components/ui/Toast";
import {
  SaleDiscount,
  DiscountType,
  SaleDiscountScope,
} from "@/lib/types/offers";

interface SaleDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale?: SaleDiscount | null;
}

interface FormState {
  title: string;
  description: string;
  discountType: DiscountType;
  value: string;
  scope: SaleDiscountScope;
  productIds: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const defaultForm: FormState = {
  title: "",
  description: "",
  discountType: "PERCENTAGE",
  value: "",
  scope: "ALL_PRODUCTS",
  productIds: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function toIso(dtLocal: string): string {
  if (!dtLocal) return "";
  return new Date(dtLocal).toISOString();
}

export default function SaleDiscountModal({
  isOpen,
  onClose,
  sale,
}: SaleDiscountModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((s) => s.offers);
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        sale
          ? {
              title: sale.title,
              description: sale.description,
              discountType: sale.discountType,
              value: sale.value.toString(),
              scope: sale.scope,
              productIds: sale.products.map((p) => p.productId).join("\n"),
              startsAt: toDatetimeLocal(sale.startsAt),
              endsAt: toDatetimeLocal(sale.endsAt),
              isActive: sale.isActive,
            }
          : defaultForm
      );
      setErrors({});
    }
  }, [isOpen, sale]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    const numVal = parseFloat(form.value);
    if (!form.value || isNaN(numVal) || numVal <= 0) {
      newErrors.value = "Value must be greater than 0";
    }
    if (form.scope === "SPECIFIC_PRODUCTS") {
      const ids = form.productIds
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      if (ids.length === 0) {
        newErrors.productIds = "At least one product ID is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const productIdList =
      form.scope === "SPECIFIC_PRODUCTS"
        ? form.productIds
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean)
        : undefined;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      value: parseFloat(form.value),
      scope: form.scope,
      ...(productIdList ? { productIds: productIdList } : {}),
      ...(form.startsAt ? { startsAt: toIso(form.startsAt) } : {}),
      ...(form.endsAt ? { endsAt: toIso(form.endsAt) } : {}),
      isActive: form.isActive,
    };

    if (sale) {
      const result = await dispatch(updateSaleDiscount({ id: sale.id, ...payload }));
      if (updateSaleDiscount.fulfilled.match(result)) {
        showToast({ type: "success", title: "Sale discount updated", message: "Changes saved successfully" });
        onClose();
      } else {
        showToast({ type: "error", title: "Error", message: result.payload as string });
      }
    } else {
      const result = await dispatch(createSaleDiscount(payload));
      if (createSaleDiscount.fulfilled.match(result)) {
        showToast({ type: "success", title: "Sale discount created", message: "New sale discount added" });
        onClose();
      } else {
        showToast({ type: "error", title: "Error", message: result.payload as string });
      }
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sale ? "Edit Sale Discount" : "New Sale Discount"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Summer Sale"
          error={errors.title}
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Optional description"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
          />
        </div>

        {/* Discount Type + Value */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Discount Type"
            value={form.discountType}
            onChange={(e) => set("discountType", e.target.value as DiscountType)}
            options={[
              { value: "PERCENTAGE", label: "Percentage" },
              { value: "FIXED_AMOUNT", label: "Fixed Amount" },
            ]}
          />
          <Input
            label={form.discountType === "PERCENTAGE" ? "Value (%)" : "Value (৳)"}
            type="number"
            min="0.01"
            step="0.01"
            value={form.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="e.g. 20"
            error={errors.value}
          />
        </div>

        {/* Scope */}
        <Select
          label="Scope"
          value={form.scope}
          onChange={(e) => set("scope", e.target.value as SaleDiscountScope)}
          options={[
            { value: "ALL_PRODUCTS", label: "All Products" },
            { value: "SPECIFIC_PRODUCTS", label: "Specific Products" },
          ]}
        />

        {/* Product IDs – only when scope = SPECIFIC_PRODUCTS */}
        {form.scope === "SPECIFIC_PRODUCTS" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product IDs
            </label>
            <textarea
              value={form.productIds}
              onChange={(e) => set("productIds", e.target.value)}
              placeholder="One product ID per line"
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border bg-white text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none ${
                errors.productIds ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200"
              }`}
            />
            {errors.productIds && (
              <p className="mt-2 text-sm text-red-500">{errors.productIds}</p>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Starts At
            </label>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Ends At
            </label>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => set("endsAt", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Active</span>
          <button
            type="button"
            onClick={() => set("isActive", !form.isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isActive ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={isSubmitting}>
            {sale ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
