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
      <div className="min-h-screen flex items-center justify-center bg-[#090D0B]">
        <div className="w-6 h-6 border-2 border-dash-border/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthSplitLayout>
      <div className="w-full relative pb-24">
        <div className="mb-14">
          <h2 className="text-[36px] font-light tracking-tight mb-2 text-dash-text leading-tight">
            Welcome back
          </h2>
          <p className="text-dash-text-secondary font-light">
            Pick up where you left off.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-8">
            {/* Email Field */}
            <div className="flex flex-col group">
              <label
                htmlFor="email"
                className="text-[10px] uppercase tracking-widest text-dash-text-muted mb-3 font-semibold"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="name@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1.5 uppercase tracking-wide">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col group">
              <label
                htmlFor="password"
                className="text-[10px] uppercase tracking-widest text-dash-text-muted mb-3 font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled pr-12 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="••••••••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 text-dash-text-muted hover:text-white text-[10px] uppercase tracking-widest font-semibold transition-colors pb-3"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 mt-1.5 uppercase tracking-wide">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-[18px] h-[18px] border border-dash-text-muted rounded-[4px] group-hover:border-white transition-colors">
                <input
                  type="checkbox"
                  className="opacity-0 absolute inset-0 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                {rememberMe && (
                  <div className="w-[10px] h-[10px] bg-white rounded-[2px]" />
                )}
              </div>
              <span className="text-sm text-dash-text-muted group-hover:text-dash-text transition-colors">
                Remember me
              </span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm text-dash-text-muted hover:text-white transition-colors"
            >
              Forgot?
            </Link>
          </div>

          {/* Distinct Circular Submit Button */}
          <div className="absolute -bottom-6 right-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-24 h-24 bg-white text-black rounded-full text-[10px] uppercase tracking-widest font-bold hover:scale-105 hover:bg-gray-200 shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="absolute bottom-12 right-0 left-0 text-center md:text-left md:left-[50%] md:pl-16 lg:pl-24">
        <p className="text-[13px] text-dash-text-muted">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-white hover:underline underline-offset-4 transition-all"
          >
            Create account
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
