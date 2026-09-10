"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught client error in ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-background border border-border rounded my-6">
          <div className="w-12 h-12 rounded-full bg-surface border border-border text-black flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-black">Component Error</h3>
          <p className="text-xs text-muted max-w-md mt-1 mb-6">
            An unexpected error occurred while rendering this section.
          </p>
          <div className="p-3 bg-surface border border-border rounded text-xs font-mono text-left w-full max-w-md mb-6 break-all">
            {this.state.error?.message || "Unknown client exception"}
          </div>
          <Button variant="default" size="sm" onClick={this.handleReset}>
            Try Resetting Section
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
