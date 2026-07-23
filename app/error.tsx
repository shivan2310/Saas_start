"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Error Caught:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="p-6 max-w-md w-full border border-border rounded bg-surface">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-xs text-muted font-mono break-all bg-background p-3 border border-border rounded text-left">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-4 w-full h-10 bg-foreground text-background font-medium text-sm rounded transition-colors hover:bg-hover"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
