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
    { label: "Journal", href: "/dashboard/diary", icon: BookOpen },
    { label: "Settings & Profile", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      <aside className="hidden min-h-screen w-[240px] shrink-0 flex-col justify-between border-r border-dash-border bg-dash-sidebar xl:flex">
        <div>
          <div className="h-16 px-6 border-b border-dash-border flex items-center gap-2 font-semibold text-base tracking-normal text-dash-text">
            <div className="w-5 h-5 bg-dash-accent rounded flex items-center justify-center text-dash-background text-[10px] font-mono">
              N
            </div>
            <span>NIVIO</span>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-dash",
                    isActive
                      ? "bg-dash-elevated text-dash-text border-l-2 border-dash-accent"
                      : "text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-dash-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover transition-dash"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

    </>
  );
};
