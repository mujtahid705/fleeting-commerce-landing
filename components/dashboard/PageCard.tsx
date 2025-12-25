"use client";

import { motion } from "framer-motion";

interface PageCardProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
}

export default function PageCard({
  children,
  title,
  action,
  className = "",
  noPadding = false,
  onClick,
}: PageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          {title && <h3 className="font-semibold text-gray-900">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </motion.div>
  );
}
