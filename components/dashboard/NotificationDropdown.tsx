"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  setDropdownOpen,
} from "@/lib/store/slices/notificationsSlice";
import { NotificationItem, NotificationType } from "@/lib/types/notifications";

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "SUBSCRIPTION_EXPIRY":
      return <Clock size={16} className="text-amber-500" />;
    case "SUBSCRIPTION_EXPIRED":
      return <AlertTriangle size={16} className="text-red-500" />;
    case "PAYMENT_SUCCESS":
      return <CheckCircle size={16} className="text-green-500" />;
    case "PAYMENT_FAILED":
      return <XCircle size={16} className="text-red-500" />;
    case "LIMIT_WARNING":
      return <AlertTriangle size={16} className="text-orange-500" />;
    case "GENERAL":
    default:
      return <Info size={16} className="text-blue-500" />;
  }
}

function getTypeBg(type: NotificationType): string {
  switch (type) {
    case "SUBSCRIPTION_EXPIRY":
      return "bg-amber-50";
    case "SUBSCRIPTION_EXPIRED":
      return "bg-red-50";
    case "PAYMENT_SUCCESS":
      return "bg-green-50";
    case "PAYMENT_FAILED":
      return "bg-red-50";
    case "LIMIT_WARNING":
      return "bg-orange-50";
    default:
      return "bg-blue-50";
  }
}

function NotificationRow({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`group relative flex gap-3 p-3 rounded-xl transition-colors cursor-pointer ${
        notification.isRead ? "bg-white hover:bg-gray-50" : "bg-primary/5 hover:bg-primary/8"
      }`}
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeBg(notification.type)}`}>
        {getTypeIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium truncate ${notification.isRead ? "text-gray-700" : "text-foreground"}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-primary rounded-full" />
          )}
        </div>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted/70 mt-1">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 transition-all"
        title="Delete"
      >
        <Trash2 size={13} className="text-red-400" />
      </button>
    </div>
  );
}

export default function NotificationDropdown() {
  const dispatch = useAppDispatch();
  const { items, unreadCount, isLoading, isDropdownOpen } = useAppSelector(
    (state) => state.notifications
  );
  const { user } = useAppSelector((state) => state.auth);
  const ref = useRef<HTMLDivElement>(null);

  const isTenantAdmin = user?.role === "TENANT_ADMIN";

  // Fetch unread count on mount for badge
  useEffect(() => {
    if (isTenantAdmin) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, isTenantAdmin]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        dispatch(setDropdownOpen(false));
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isDropdownOpen, dispatch]);

  const handleToggle = useCallback(() => {
    if (!isDropdownOpen) {
      dispatch(setDropdownOpen(true));
      dispatch(fetchNotifications());
    } else {
      dispatch(setDropdownOpen(false));
    }
  }, [isDropdownOpen, dispatch]);

  const handleMarkRead = useCallback(
    (id: string) => {
      dispatch(markNotificationRead(id));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deleteNotification(id));
    },
    [dispatch]
  );

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllNotificationsRead());
  }, [dispatch]);

  if (!isTenantAdmin) return null;

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} className="text-muted" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => dispatch(setDropdownOpen(false))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={16} className="text-muted" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[440px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl">
                      <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-full" />
                        <div className="h-2 bg-gray-100 rounded animate-pulse w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <Bell size={24} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No notifications</p>
                  <p className="text-xs text-muted mt-1">You&apos;re all caught up!</p>
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {items.map((notification) => (
                    <NotificationRow
                      key={notification.id}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
