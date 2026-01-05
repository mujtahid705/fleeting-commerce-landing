import { AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { ReactNode } from "react";

interface WarningBannerProps {
  title: string;
  message: ReactNode;
  variant?: "warning" | "info" | "error" | "success";
  icon?: ReactNode;
  className?: string;
}

const variantStyles = {
  warning: {
    container: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-900",
    message: "text-amber-800",
  },
  info: {
    container: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-900",
    message: "text-blue-800",
  },
  error: {
    container: "bg-red-50 border-red-200",
    icon: "text-red-600",
    title: "text-red-900",
    message: "text-red-800",
  },
  success: {
    container: "bg-green-50 border-green-200",
    icon: "text-green-600",
    title: "text-green-900",
    message: "text-green-800",
  },
};

const defaultIcons = {
  warning: AlertTriangle,
  info: Info,
  error: XCircle,
  success: AlertCircle,
};

export default function WarningBanner({
  title,
  message,
  variant = "warning",
  icon,
  className = "",
}: WarningBannerProps) {
  const styles = variantStyles[variant];
  const IconComponent = defaultIcons[variant];

  return (
    <div
      className={`p-4 border rounded-xl flex items-start gap-3 ${styles.container} ${className}`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
        {icon || <IconComponent size={20} />}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold mb-1 ${styles.title}`}>{title}</h4>
        <div className={`text-sm ${styles.message}`}>{message}</div>
      </div>
    </div>
  );
}
