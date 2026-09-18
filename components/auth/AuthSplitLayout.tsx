import React from "react";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col md:flex-row bg-[#090D0B] text-dash-text overflow-hidden">
      {/* LEFT PANEL */}
      <div className="relative hidden md:flex w-1/2 flex-col justify-between border-r border-dash-border/30 overflow-hidden">
        
        {/* Subtle internal structural vertical line */}
        <div className="absolute top-0 bottom-0 left-1/3 border-r border-dash-border/10 pointer-events-none" />

        {/* Brand (Absolute positioned at top-left) */}
        <div className="absolute z-10" style={{ left: "72px", top: "78px" }}>
          <div className="text-xl font-medium tracking-widest text-dash-text">NIVIO</div>
        </div>

        {/* Abstract Minimal Artwork (Single curve + dot) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1000 1000"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Extremely thin curved line from bottom-left to upper-right */}
            <path
              d="M-50 900 C 300 800, 400 300, 1100 100"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-dash-text-muted opacity-30"
            />
            {/* Single small circular dot positioned along the curve */}
            <circle
              cx="550"
              cy="348"
              r="3"
              fill="currentColor"
              className="text-dash-text opacity-50"
            />
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
