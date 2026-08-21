import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-dash-text-secondary uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-dash-surface px-3 py-2 text-sm text-dash-text placeholder:text-dash-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dash-accent focus-visible:border-dash-accent disabled:cursor-not-allowed disabled:opacity-50 transition-dash resize-y",
            error && "border-dash-text ring-2 ring-dash-text",
            className
          )}
          ref={ref}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-dash-text mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-dash-text-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
