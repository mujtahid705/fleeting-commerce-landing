export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
}

export interface UsersState {
  users: Customer[];
  selectedUser: Customer | null;
  isLoading: boolean;
  error: string | null;
}
