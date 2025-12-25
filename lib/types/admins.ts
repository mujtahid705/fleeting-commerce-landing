import { UserRole } from "./auth";

export interface Admin {
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

export interface CreateSuperAdminPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface CreateTenantAdminPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  tenantId: string;
}

export interface SuperAdminsState {
  admins: Admin[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export interface TenantAdminsState {
  admins: Admin[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}
