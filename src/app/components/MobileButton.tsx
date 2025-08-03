"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface MobileButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    children, 
    variant = "primary", 
    size = "md", 
    leftIcon, 
    rightIcon, 
    loading = false,
    fullWidth = false,
    className = "", 
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[40px]",
      md: "px-4 py-3 text-base min-h-[44px]",
      lg: "px-6 py-4 text-lg min-h-[48px]"
    };

    const variantClasses = {
      primary: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg focus:ring-green-500 active:scale-95",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 active:scale-95",
      outline: "border-2 border-green-500 text-green-600 hover:bg-green-50 focus:ring-green-500 active:scale-95",
      ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:scale-95",
      danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 active:scale-95"
    };

    const widthClasses = fullWidth ? "w-full" : "";

    const buttonClasses = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      widthClasses,
      className
    ].join(" ");

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        
        <span>{children}</span>
        
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

MobileButton.displayName = "MobileButton";

export default MobileButton; 