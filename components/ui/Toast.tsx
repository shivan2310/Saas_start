"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ type = "info", title, description }: { type?: ToastType; title: string; description?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, description };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-lg border bg-dash-card shadow-lg transition-all animate-in slide-in-from-bottom-5",
              t.type === "success" && "border-dash-accent/30",
              t.type === "error" && "border-red-500/30",
              t.type === "info" && "border-dash-border"
            )}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-dash-accent" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
              {t.type === "info" && <Info className="h-4 w-4 text-dash-text-secondary" />}
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-semibold text-dash-text">{t.title}</h4>
              {t.description && <p className="text-xs text-dash-text-muted mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-dash-text-muted hover:text-dash-text transition-dash"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
