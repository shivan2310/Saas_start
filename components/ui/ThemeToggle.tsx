"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        disabled
        className={`inline-flex items-center justify-center p-2 rounded-md border border-dash-border/60 bg-dash-card/50 text-dash-text-muted opacity-60 ${className}`}
      >
        <Moon className="h-4 w-4" />
        {showLabel && <span className="ml-2 text-xs font-medium">Theme</span>}
      </button>
    );
  }

  const isDark = theme === "dark";
  const tooltipText = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <div className="relative group/toggle inline-flex items-center">
      <button
        type="button"
        id="theme-toggle-button"
        aria-label={tooltipText}
        onClick={toggleTheme}
        className={`inline-flex items-center justify-center gap-2 p-2 rounded-md border border-dash-border-secondary bg-dash-card hover:bg-dash-hover text-dash-text-secondary hover:text-dash-text transition-dash focus-dash ${className}`}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform group-hover/toggle:rotate-45" />
        ) : (
          <Moon className="h-4 w-4 text-dash-text-secondary group-hover/toggle:text-dash-text transition-transform group-hover/toggle:-rotate-12" />
        )}
        {showLabel && (
          <span className="text-xs font-medium text-dash-text select-none">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        )}
      </button>

      {!showLabel && (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-0 top-full mt-2 hidden group-hover/toggle:flex group-focus-within/toggle:flex items-center px-2 py-1 rounded bg-dash-text text-dash-background text-[11px] font-medium whitespace-nowrap shadow-md z-50 transition-opacity animate-in fade-in zoom-in-95 duration-150"
        >
          {tooltipText}
        </span>
      )}
    </div>
  );
};

