import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-dash-text-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3 text-dash-text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-md border bg-dash-surface px-3 py-2 text-sm text-dash-text placeholder:text-dash-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent focus-visible:border-dash-accent disabled:cursor-not-allowed disabled:opacity-50 transition-dash",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-dash-text ring-2 ring-dash-text",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-dash-text-muted flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-dash-text mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-dash-text-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
