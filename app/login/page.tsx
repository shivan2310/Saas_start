"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await authService.login(data.email, data.password);
      toast({ type: "success", title: "Success", description: "Logged in successfully." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = getAuthErrorMessage(error, "Invalid email or password.");
      toast({ type: "error", title: "Authentication Error", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dash-background">
        <div className="w-6 h-6 border-2 border-dash-border border-t-dash-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthSplitLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-light tracking-tight mb-2 text-dash-text">
          Welcome back
        </h2>
        <p className="text-dash-text-secondary font-light">
          Pick up where you left off.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-widest text-dash-text-muted mb-2 font-medium"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full bg-transparent border-0 border-b border-dash-border pb-2 text-dash-text focus:ring-0 focus:border-dash-text transition-colors outline-none placeholder:text-dash-text-disabled ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="name@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-widest text-dash-text-muted mb-2 font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`w-full bg-transparent border-0 border-b border-dash-border pb-2 text-dash-text focus:ring-0 focus:border-dash-text transition-colors outline-none placeholder:text-dash-text-disabled pr-10 ${
                  errors.password ? "border-red-500" : ""
                }`}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 text-dash-text-muted hover:text-dash-text text-xs uppercase tracking-wider font-medium"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 border border-dash-border rounded-sm group-hover:border-dash-text-muted transition-colors">
              <input
                type="checkbox"
                className="opacity-0 absolute inset-0 cursor-pointer"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              {rememberMe && (
                <div className="w-2 h-2 bg-dash-text rounded-[1px]" />
              )}
            </div>
            <span className="text-sm text-dash-text-secondary group-hover:text-dash-text transition-colors">
              Remember me
            </span>
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-dash-text-secondary hover:text-dash-text transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <div className="flex justify-end mt-10">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-dash-text text-dash-background px-8 py-3 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shadow-lg"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-dash-background border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign in"
            )}
          </button>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-dash-text-secondary">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-dash-text hover:underline underline-offset-4 transition-all"
            >
              Create account
            </Link>
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
