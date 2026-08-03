"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { User, CheckCircle2, AlertTriangle, LogOut, Menu, X, LayoutDashboard, CheckSquare, Wallet, CalendarDays, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const TopNavbar: React.FC = () => {
  const { profile, user, isEmailVerified } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "To-dos", href: "/dashboard/tasks", icon: CheckSquare },
    { label: "Expenses", href: "/dashboard/expenses", icon: Wallet },
    { label: "Important Dates", href: "/dashboard/dates", icon: CalendarDays },
    { label: "Journal", href: "/dashboard/diary", icon: BookOpen },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Left side on mobile */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded p-2 text-black hover:bg-surface"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <div className="font-bold text-sm tracking-tight text-black flex items-center gap-1.5 ml-1">
            <div className="w-4 h-4 bg-black rounded flex items-center justify-center text-white text-[9px] font-mono">
              S
            </div>
            <span>NIVIO</span>
          </div>
        </div>

        {/* Right side icons & info - visible on both mobile and desktop */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 ml-auto">
          <ThemeToggle />

          {/* Email Verification status badge */}
          {!isEmailVerified ? (
            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-[11px] font-medium text-black"
              title="Email not verified"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-black" />
              <span>Unverified</span>
            </div>
          ) : (
            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-[11px] font-medium text-black"
              title="Email verified"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-black" />
              <span>Verified</span>
            </div>
          )}

          {/* User Pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-black font-semibold text-xs shrink-0">
              {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-black leading-none truncate max-w-[100px]">
                {profile?.displayName || "User"}
              </span>
              <span className="text-[10px] text-muted leading-tight mt-0.5 truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="xl:hidden p-1.5 text-muted hover:text-black rounded-md hover:bg-surface transition-colors"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          aria-label="Mobile dashboard navigation"
          className="xl:hidden flex w-full flex-col gap-1 border-t border-border bg-white px-3 py-3"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-colors",
                  isActive ? "bg-black text-white" : "text-muted hover:bg-surface hover:text-black"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};
