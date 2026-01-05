// Order Types

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderUser {
  id: string;
  name: string;
  email: string;
}

export interface OrderProduct {
  id: string;
  title: string;
  price: number;
  images?: { imageUrl: string }[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: OrderProduct;
}

export interface Order {
  id: number;
  userId: string;
  tenantId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  order_items: OrderItem[];
  user: OrderUser;
}

export interface OrdersState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

export interface CreateOrderData {
  order_items: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusData {
  id: number;
  status: OrderStatus;
}
