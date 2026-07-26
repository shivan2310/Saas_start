"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CheckSquare, Wallet, CalendarDays, BookOpen, Settings, LogOut } from "lucide-react";
import { authService } from "@/services/authService";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "To-dos", href: "/dashboard/tasks", icon: CheckSquare },
    { label: "Expenses", href: "/dashboard/expenses", icon: Wallet },
    { label: "Important Dates", href: "/dashboard/dates", icon: CalendarDays },
    { label: "Diary", href: "/dashboard/diary", icon: BookOpen },
    { label: "Settings & Profile", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      <aside className="w-64 border-r border-border bg-white flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
        <div>
        {/* Brand */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-2 font-bold text-base tracking-tight text-black">
          <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-[10px] font-mono">
            S
          </div>
          <span>DAYBOOK</span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-muted hover:text-black hover:bg-surface"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        </div>

        {/* Footer / Account */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium text-muted hover:text-black hover:bg-surface transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

    </>
  );
};
