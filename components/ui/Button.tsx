import { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-full transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed",
    secondary:
      "bg-secondary text-foreground hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-60 disabled:cursor-not-allowed",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
