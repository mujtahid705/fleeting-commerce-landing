// Subscription Types

export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxProducts: number;
  maxCategories: number;
  maxSubcategoriesPerCategory: number;
  maxOrders?: number;
}

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  trialEndsAt: string | null;
  plan: SubscriptionPlan;
  currentStatus?: SubscriptionStatus;
  daysRemaining?: number;
  isInGracePeriod?: boolean;
  gracePeriodDaysRemaining?: number;
}

export interface UsageData {
  products: { used: number; limit: number; remaining: number };
  categories: { used: number; limit: number; remaining: number };
  subcategoriesPerCategory: { maxUsed: number; limit: number };
  plan?: SubscriptionPlan;
}

export interface AccessStatus {
  hasAccess: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isInGracePeriod?: boolean;
  gracePeriodDaysRemaining?: number;
  daysRemaining?: number;
  message?: string;
}

export interface SubscriptionsState {
  currentSubscription: Subscription | null;
  usage: UsageData | null;
  accessStatus: AccessStatus | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface SelectPlanResponse {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  requiresPayment: boolean;
}
