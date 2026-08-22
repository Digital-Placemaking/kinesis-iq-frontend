/**
 * app/admin/components/FormField.tsx
 * Form field component.
 * Reusable input field with label and icon support for admin forms.
 */
"use client";

import React, { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

export interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  helpText?: string;
  /** Show an eye toggle to reveal password text (for type="password"). */
  passwordToggle?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon: Icon,
  helpText,
  passwordToggle = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const canToggle = passwordToggle && type === "password";
  const inputType = canToggle && showPassword ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-black dark:text-zinc-50"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border border-zinc-300 bg-white py-3 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${
            Icon ? "pl-10" : "pl-4"
          } ${canToggle ? "pr-10" : "pr-4"}`}
        />
        {canToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {helpText && (
        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
