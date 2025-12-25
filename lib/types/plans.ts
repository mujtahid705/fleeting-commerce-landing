// Plan Types

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "MONTHLY" | "YEARLY";
  trialDays: number;
  maxProducts: number;
  maxCategories: number;
  maxSubcategoriesPerCategory: number;
  maxOrders: number;
  customDomain: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlansState {
  plans: Plan[];
  selectedPlan: Plan | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface CreatePlanData {
  name: string;
  price: number;
  currency?: string;
  interval?: "MONTHLY" | "YEARLY";
  trialDays?: number;
  maxProducts: number;
  maxCategories: number;
  maxSubcategoriesPerCategory: number;
  maxOrders?: number;
  customDomain?: boolean;
}

export interface UpdatePlanData extends Partial<CreatePlanData> {
  id: string;
  isActive?: boolean;
}
