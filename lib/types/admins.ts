import { UserRole } from "./auth";

export interface Admin {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role?: UserRole;
  tenantId?: string | null;
  isActive?: boolean;
  isPrimary?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  tenantId?: string;
}

export interface UpdateTenantAdminStatusPayload {
  id: string;
  isActive: boolean;
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
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  activeActionId: string | null;
  error: string | null;
}
