"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { User, CheckCircle2, AlertTriangle, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const TopNavbar: React.FC = () => {
  const { profile, user, isEmailVerified } = useAuth();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-black tracking-tight">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        {/* Email Verification status badge */}
        {!isEmailVerified ? (
          <div
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-border text-[11px] font-medium text-black"
            title="Email not verified"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-black" />
            <span>Unverified Email</span>
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
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-black font-semibold text-xs">
            {profile?.displayName ? profile.displayName.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-black leading-none">
              {profile?.displayName || "User"}
            </span>
            <span className="text-[10px] text-muted leading-tight mt-0.5">
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="md:hidden p-1.5 text-muted hover:text-black"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
