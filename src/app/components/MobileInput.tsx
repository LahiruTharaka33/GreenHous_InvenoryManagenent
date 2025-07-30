"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, helperText, fullWidth = false, className = "", ...props }, ref) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-green-500 focus:border-green-500
            transition-colors duration-200
            text-base
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";

export default MobileInput; 

//ade