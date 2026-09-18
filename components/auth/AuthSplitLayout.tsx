import React from "react";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row bg-dash-background text-dash-text">
      {/* LEFT PANEL */}
      <div className="relative hidden md:flex w-1/2 flex-col justify-between p-12 lg:p-20 border-r border-dash-border overflow-hidden">
        {/* Brand */}
        <div className="z-10 text-xl font-medium tracking-wide">NIVIO</div>

        {/* Abstract Minimal Artwork */}
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
            {/* Extremely thin curved line */}
            <path
              d="M-100 800 C 300 800, 400 200, 1100 100"
              stroke="currentColor"
              strokeWidth="1"
              className="text-dash-text-muted opacity-30"
            />
            {/* Small geometric object subtly placed on path */}
            <circle
              cx="550"
              cy="371"
              r="4"
              fill="currentColor"
              className="text-dash-text opacity-70"
            />
            {/* Additional subtle line for asymmetry */}
            <path
              d="M700 -100 L 700 1100"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-dash-text-muted opacity-20"
            />
          </svg>
        </div>

        {/* Copy */}
        <div className="z-10 max-w-md mt-auto">
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-4 text-dash-text">
            A more intentional you.
          </h1>
          <p className="text-lg text-dash-text-secondary font-light mb-8">
            One place for your day.
          </p>
          <div className="text-xs uppercase tracking-widest text-dash-text-muted font-medium">
            Organize · Reflect · Grow
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-24">
        {/* Mobile brand (hidden on desktop) */}
        <div className="md:hidden text-xl font-medium tracking-wide mb-12">NIVIO</div>
        
        <div className="w-full max-w-[420px] mx-auto">
          {children}
        </div>
      </div>
    </main>
  );
}
