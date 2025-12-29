export type UserRole = "SUPER_ADMIN" | "TENANT_ADMIN" | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  tenantId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  hasUsedTrial: boolean;
  brandSetupCompleted: boolean;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  maxProducts: number;
  maxCategories: number;
  maxSubcategoriesPerCategory: number;
  maxOrders: number;
}

export interface Subscription {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIAL";
  startDate: string;
  endDate: string;
  trialEndsAt: string | null;
  plan: Plan;
}

export interface Access {
  hasAccess: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isInGracePeriod: boolean;
  gracePeriodDaysRemaining: number;
  daysRemaining: number;
  message: string;
}

export interface Usage {
  products: { used: number; limit: number; remaining: number };
  categories: { used: number; limit: number; remaining: number };
  subcategoriesPerCategory: { maxUsed: number; limit: number };
}

export interface SessionData {
  user: User;
  tenant: Tenant | null;
  subscription: Subscription | null;
  access: Access;
  usage: Usage | null;
  unreadNotifications: number;
  brand?: { id?: string; domain?: string } | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterTenantAdminRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  tenantName: string;
}

export interface RegisterTenantAdminResponse {
  message: string;
  data: User;
}

export interface ValidateSessionResponse {
  message: string;
  data: SessionData;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tenant: Tenant | null;
  subscription: Subscription | null;
  access: Access | null;
  usage: Usage | null;
  unreadNotifications: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionValidated: boolean;
  error: string | null;
}

// OTP Registration Types
export interface InitiateRegistrationRequest {
  email: string;
}

export interface InitiateRegistrationResponse {
  message: string;
  data: {
    email: string;
    expiresIn: string;
  };
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  name: string;
  password: string;
  phone: string;
  tenantName: string;
}

export interface VerifyOtpResponse {
  message: string;
  data: {
    user: User;
    tenant: Tenant;
  };
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
  data: {
    email: string;
    expiresIn: string;
  };
}
