import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-sm rounded select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-hover active:bg-black",
        secondary: "bg-surface text-black border border-border hover:bg-border active:bg-surface",
        outline: "bg-transparent text-black border border-border hover:bg-surface active:bg-transparent",
        ghost: "bg-transparent text-black hover:bg-surface active:bg-transparent",
        danger: "bg-black text-white border border-black hover:bg-hover",
        "dash-primary": "bg-dash-elevated text-dash-text hover:bg-dash-hover border border-dash-border",
        "dash-secondary": "bg-transparent text-dash-text border border-dash-border hover:bg-dash-hover",
        "dash-ghost": "bg-transparent text-dash-text-secondary hover:bg-dash-hover hover:text-dash-text",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
        "dash-default": "py-[8px] px-[12px] text-[13px] leading-tight rounded-md",
        "dash-sm": "py-[6px] px-[10px] text-xs leading-tight rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="ml-2 inline-flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
