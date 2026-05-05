"use client";

import { useState, useEffect, FormEvent } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { createCoupon, updateCoupon } from "@/lib/store/slices/offersSlice";
import { useToast } from "@/components/ui/Toast";
import { Coupon, DiscountType } from "@/lib/types/offers";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
}

interface FormState {
  code: string;
  description: string;
  discountType: DiscountType;
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

const defaultForm: FormState = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  value: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "",
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

export default function CouponModal({ isOpen, onClose, coupon }: CouponModalProps) {
  const dispatch = useAppDispatch();
  const { isSubmitting } = useAppSelector((s) => s.offers);
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm(
        coupon
          ? {
              code: coupon.code,
              description: coupon.description,
              discountType: coupon.discountType,
              value: coupon.value.toString(),
              minOrderAmount: coupon.minOrderAmount != null ? coupon.minOrderAmount.toString() : "",
              maxDiscountAmount: coupon.maxDiscountAmount != null ? coupon.maxDiscountAmount.toString() : "",
              usageLimit: coupon.usageLimit != null ? coupon.usageLimit.toString() : "",
              startsAt: toDatetimeLocal(coupon.startsAt),
              endsAt: toDatetimeLocal(coupon.endsAt),
              isActive: coupon.isActive,
            }
          : defaultForm
      );
      setErrors({});
    }
  }, [isOpen, coupon]);

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = "Code is required";
    const numVal = parseFloat(form.value);
    if (!form.value || isNaN(numVal) || numVal <= 0) {
      newErrors.value = "Value must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      discountType: form.discountType,
      value: parseFloat(form.value),
      ...(form.minOrderAmount ? { minOrderAmount: parseFloat(form.minOrderAmount) } : {}),
      ...(form.maxDiscountAmount ? { maxDiscountAmount: parseFloat(form.maxDiscountAmount) } : {}),
      ...(form.usageLimit ? { usageLimit: parseInt(form.usageLimit, 10) } : {}),
      ...(form.startsAt ? { startsAt: toIso(form.startsAt) } : {}),
      ...(form.endsAt ? { endsAt: toIso(form.endsAt) } : {}),
      isActive: form.isActive,
    };

    if (coupon) {
      const result = await dispatch(updateCoupon({ id: coupon.id, ...payload }));
      if (updateCoupon.fulfilled.match(result)) {
        showToast({ type: "success", title: "Coupon updated", message: "Changes saved successfully" });
        onClose();
      } else {
        showToast({ type: "error", title: "Error", message: result.payload as string });
      }
    } else {
      const result = await dispatch(createCoupon(payload));
      if (createCoupon.fulfilled.match(result)) {
        showToast({ type: "success", title: "Coupon created", message: "New coupon added" });
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
      title={coupon ? "Edit Coupon" : "New Coupon"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Code */}
        <div>
          <Input
            label="Code"
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="e.g. SUMMER25"
            error={errors.code}
          />
          <p className="mt-1 text-xs text-muted">Will be stored uppercase</p>
        </div>

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
            placeholder="e.g. 10"
            error={errors.value}
          />
        </div>

        {/* Min Order + Max Discount */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Min Order Amount (৳)"
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderAmount}
            onChange={(e) => set("minOrderAmount", e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Max Discount Amount (৳)"
            type="number"
            min="0"
            step="0.01"
            value={form.maxDiscountAmount}
            onChange={(e) => set("maxDiscountAmount", e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* Usage Limit */}
        <Input
          label="Usage Limit"
          type="number"
          min="1"
          step="1"
          value={form.usageLimit}
          onChange={(e) => set("usageLimit", e.target.value)}
          placeholder="Leave empty for unlimited"
        />

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
            {coupon ? "Save Changes" : "Create"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
