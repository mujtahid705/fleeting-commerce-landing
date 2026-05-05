export type NotificationType =
  | "SUBSCRIPTION_EXPIRY"
  | "SUBSCRIPTION_EXPIRED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "LIMIT_WARNING"
  | "GENERAL";

export interface NotificationItem {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isDropdownOpen: boolean;
  error: string | null;
}
