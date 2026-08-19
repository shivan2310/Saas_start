"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isEmailVerified, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    } else if (!loading && !isEmailVerified) {
      router.replace("/verify-email");
    }
  }, [isAuthenticated, isEmailVerified, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dash-background text-dash-text">
        <div className="w-8 h-8 border-2 border-dash-border border-t-dash-accent rounded-full animate-spin mb-3" />
        <p className="text-xs font-mono text-dash-text-muted uppercase tracking-wider">Authenticating Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isEmailVerified) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-dash-background text-dash-text font-sans selection:bg-dash-accent-bg selection:text-dash-text">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-10">{children}</main>
      </div>
    </div>
  );
}
