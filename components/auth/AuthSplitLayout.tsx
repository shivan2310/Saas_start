"use client";

import React from "react";
import { FlowingRibbons } from "@/components/auth/FlowingRibbons";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-[100dvh] w-full flex flex-col md:flex-row bg-[#080A09] text-white overflow-hidden">
      {/* LEFT PANEL — Branding */}
      <div className="relative hidden md:flex w-1/2 flex-col justify-between overflow-hidden">
        {/* Flowing ribbon artwork (behind all text) */}
        <FlowingRibbons />

        {/* Subtle vertical divider on the right edge of left panel */}
        <div className="absolute top-0 bottom-0 right-0 w-px bg-white/[0.06]" />

        {/* Brand — top-left with generous space */}
        <div className="relative z-10 pt-16 pl-16">
          <div className="text-[15px] font-medium tracking-[0.3em] text-white/90">
            NIVIO
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Editorial copy — lower-left */}
        <div className="relative z-10 pl-16 pb-20 pr-16 max-w-[480px]">
          <h1 className="text-[clamp(2.4rem,4vw,3.2rem)] font-light tracking-tight mb-5 text-white leading-[1.15]">
            A more intentional<br />you.
          </h1>
          <p className="text-[17px] text-white/50 font-light mb-8 leading-relaxed">
            One place for your day.
          </p>
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-medium">
            Organize · Reflect · Grow
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="flex-1 md:w-1/2 flex flex-col justify-center relative min-h-[100dvh] md:min-h-0 overflow-y-auto md:overflow-hidden py-12 md:py-0">
        {/* Mobile brand (hidden on desktop) */}
        <div className="md:hidden absolute top-8 left-6">
          <div className="text-[13px] font-medium tracking-[0.3em] text-white/90">NIVIO</div>
        </div>

        {/* Form area — centered vertically, constrained width */}
        <div className="w-full max-w-[380px] mx-auto px-6 sm:px-0">
          {children}
        </div>
      </div>
    </main>
  );
}
