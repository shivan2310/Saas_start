import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  label = "Loading...",
}) => {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2" role="status">
      <div
        className={cn(
          "rounded-full border-border border-t-black animate-spin",
          sizeMap[size],
          className
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
};
