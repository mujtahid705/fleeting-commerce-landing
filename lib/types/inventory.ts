// Inventory Types

export interface InventoryProduct {
  id: string;
  title: string;
  price: number;
  images?: { imageUrl: string }[];
}

export interface InventoryItem {
  id: string;
  productId: string;
  tenantId: string;
  quantity: number;
  addedBy: string;
  createdAt: string;
  updatedAt?: string;
  product?: InventoryProduct;
}

export interface InventoryState {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface AddInventoryData {
  productId: string;
  quantity: number;
}

export interface UpdateInventoryData {
  productId: string;
  quantity: number;
}
