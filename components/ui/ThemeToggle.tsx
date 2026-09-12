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

  return (
    <button
      type="button"
      id="theme-toggle-button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-md border border-dash-border/70 bg-dash-card hover:bg-dash-hover text-dash-text-secondary hover:text-dash-text transition-dash shadow-sm ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium text-dash-text select-none">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};

