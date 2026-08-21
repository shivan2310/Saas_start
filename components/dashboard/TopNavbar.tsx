"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { User, CheckCircle2, AlertTriangle, LogOut, Menu, X, LayoutDashboard, CheckSquare, Wallet, CalendarDays, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const TopNavbar: React.FC = () => {
  const { profile, user, isEmailVerified } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b border-dash-border bg-dash-background/95 backdrop-blur">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
        {/* Left side on mobile */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close dashboard menu" : "Open dashboard menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded p-2 text-dash-text hover:bg-dash-hover"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="font-semibold text-sm tracking-normal text-dash-text flex items-center gap-1.5 ml-1">
            <div className="w-4 h-4 bg-dash-accent rounded flex items-center justify-center text-dash-background text-[9px] font-mono">
              N
            </div>
            <span>NIVIO</span>
          </div>
        </div>

        {/* Right side icons & info - visible on both mobile and desktop */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 ml-auto">
          {/* Email Verification status badge */}
          {!isEmailVerified ? (
            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-dash-card border border-dash-border text-[11px] font-medium text-dash-text"
              title="Email not verified"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-dash-text" />
              <span>Unverified</span>
            </div>
          ) : (
            <div
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-dash-card border border-dash-border text-[11px] font-medium text-dash-text"
              title="Email verified"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-dash-text" />
              <span>Verified</span>
            </div>
          )}

          {/* User Pill */}
          <div className="flex items-center gap-2 pl-3 border-l border-dash-border">
            <div className="w-8 h-8 rounded-full bg-dash-card border border-dash-border flex items-center justify-center text-dash-text font-semibold text-xs shrink-0 overflow-hidden">
              {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="User profile" className="w-full h-full object-cover" />
              ) : profile?.displayName ? (
                profile.displayName.charAt(0).toUpperCase()
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-dash-text leading-none truncate max-w-[100px]">
                {profile?.displayName || "User"}
              </span>
              <span className="text-[10px] text-dash-text-muted leading-tight mt-0.5 truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="xl:hidden p-1.5 text-dash-text-secondary hover:text-dash-text rounded-md hover:bg-dash-hover transition-dash"
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
          className="xl:hidden flex w-full flex-col gap-1 border-t border-dash-border bg-dash-background px-3 py-3"
        >
          {[
            { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
            { label: "To-dos", href: "/dashboard/tasks", icon: CheckSquare },
            { label: "Expenses", href: "/dashboard/expenses", icon: Wallet },
            { label: "Important Dates", href: "/dashboard/dates", icon: CalendarDays },
            { label: "Journal", href: "/dashboard/diary", icon: BookOpen },
            { label: "Settings & Profile", href: "/dashboard/settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded px-3 py-2.5 text-[13px] font-medium transition-dash",
                  isActive ? "bg-dash-elevated text-dash-text border-l-2 border-dash-accent" : "text-dash-text-secondary hover:bg-dash-hover hover:text-dash-text"
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
