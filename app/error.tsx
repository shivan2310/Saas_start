"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-dash-background px-4 text-center">
      <div className="p-6 max-w-md w-full border border-dash-border rounded-lg bg-dash-card">
        <h2 className="text-lg font-semibold text-dash-text">Something went wrong</h2>
        <p className="mt-2 text-xs text-dash-text-muted font-mono break-all bg-dash-surface p-3 border border-dash-border rounded text-left">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button onClick={() => reset()} className="mt-4 w-full" variant="dash-primary">
          Try Again
        </Button>
      </div>
    </main>
  );
}
