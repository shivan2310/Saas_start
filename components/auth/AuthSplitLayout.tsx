import React from "react";
import { GatewayFlow } from "@/components/ui/gateway-flow";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-[#090D0B] text-dash-text overflow-hidden">
      {/* LEFT PANEL */}
      <div className="relative hidden md:flex w-1/2 flex-col justify-between border-r border-dash-border/30 overflow-hidden">
        
        {/* Gateway Flow background */}
        <GatewayFlow />

        {/* Subtle internal structural vertical line */}
        <div className="absolute top-0 bottom-0 left-1/3 border-r border-dash-border/10 pointer-events-none" />

        {/* Brand (Absolute positioned at top-left) */}
        <div className="absolute z-10" style={{ left: "72px", top: "78px" }}>
          <div className="text-xl font-medium tracking-widest text-dash-text">NIVIO</div>
        </div>

        {/* Abstract Minimal Artwork (Geometric Star) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 100 100"
            className="w-64 h-64 text-dash-text-muted stroke-current opacity-40 animate-[pulse-slow_8s_infinite_ease-in-out]"
            strokeWidth="0.75"
            fill="none"
            strokeLinecap="round"
          >
            {/* Main Cross */}
            <line x1="50" y1="15" x2="50" y2="85" />
            <line x1="15" y1="50" x2="85" y2="50" />
            {/* Diagonal Cross */}
            <line x1="25" y1="25" x2="75" y2="75" />
            <line x1="25" y1="75" x2="75" y2="25" />
            {/* Outer connecting lines for structural look */}
            <line x1="50" y1="15" x2="75" y2="25" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="75" y1="25" x2="85" y2="50" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="85" y1="50" x2="75" y2="75" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="75" y1="75" x2="50" y2="85" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="50" y1="85" x2="25" y2="75" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="25" y1="75" x2="15" y2="50" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="15" y1="50" x2="25" y2="25" strokeWidth="0.25" strokeOpacity="0.3" />
            <line x1="25" y1="25" x2="50" y2="15" strokeWidth="0.25" strokeOpacity="0.3" />
          </svg>
        </div>

        {/* Copy (Absolute positioned at bottom-left) */}
        <div className="absolute z-10" style={{ left: "72px", bottom: "150px" }}>
          <h1 className="text-5xl font-light tracking-tight mb-4 text-dash-text leading-tight">
            A more intentional<br />you.
          </h1>
          <p className="text-lg text-dash-text-secondary font-light mb-8">
            One place for your day.
          </p>
          <div className="text-[10px] uppercase tracking-[0.2em] text-dash-text-muted font-medium">
            ORGANIZE · REFLECT · GROW
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center relative bg-transparent">
        {/* Mobile brand (hidden on desktop) */}
        <div className="md:hidden absolute top-8 left-8">
          <div className="text-xl font-medium tracking-widest text-dash-text">NIVIO</div>
        </div>
        
        {/* The form area */}
        <div className="w-full max-w-[400px] mx-auto px-6 sm:px-0">
          {children}
        </div>
      </div>
    </main>
  );
}
