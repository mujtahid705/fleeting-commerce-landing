export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";
export type SaleDiscountScope = "ALL_PRODUCTS" | "SPECIFIC_PRODUCTS";

export interface ActiveSaleDiscount {
  id: string;
  title: string;
  discountType: DiscountType;
  value: number;
  scope: SaleDiscountScope;
  startsAt: string | null;
  endsAt: string | null;
}

export interface ProductPricing {
  originalPrice: number;
  salePrice: number;
  saleDiscountAmount: number;
  saleDiscountPercentage: number;
  activeSaleDiscount: ActiveSaleDiscount | null;
}

export interface SaleDiscountProduct {
  id: string;
  saleDiscountId: string;
  productId: string;
}

export interface SaleDiscount {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  discountType: DiscountType;
  value: number;
  scope: SaleDiscountScope;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  products: SaleDiscountProduct[];
}

export interface Coupon {
  id: string;
  tenantId: string;
  code: string;
  description: string;
  discountType: DiscountType;
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDiscountPayload {
  title: string;
  description: string;
  discountType: DiscountType;
  value: number;
  scope: SaleDiscountScope;
  productIds?: string[];
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface UpdateSaleDiscountPayload extends Partial<CreateSaleDiscountPayload> {
  id: string;
}

export interface CreateCouponPayload {
  code: string;
  description: string;
  discountType: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
  id: string;
}

export interface OffersState {
  sales: SaleDiscount[];
  coupons: Coupon[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}
