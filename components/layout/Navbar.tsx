"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Documentation", href: "#docs" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-none">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-black tracking-tight">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs font-mono">
            S
          </div>
          <span>SAAS_STARTER</span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-wider text-muted hover:text-black transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          {loading ? (
            <div className="h-9 w-20 bg-surface rounded animate-pulse" />
          ) : isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button size="sm" variant="default" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Dashboard
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" variant="default">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2 text-black"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-black py-2 border-b border-border/50"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-medium text-muted">Theme</span>
              <ThemeToggle />
            </div>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Dashboard</Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
