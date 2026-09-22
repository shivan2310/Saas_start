"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthActive, setOauthActive] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Show OAuth callback errors
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const messages: Record<string, string> = {
        provider_error: "Authentication was cancelled or the provider returned an error.",
        missing_code: "Authentication failed. Please try again.",
        auth_callback_failed: "Could not complete sign in. Please try again.",
        server_error: "A server error occurred. Please try again later.",
      };
      toast({
        type: "error",
        title: "Sign In Failed",
        description: messages[error] || "An unexpected error occurred.",
      });
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, toast, router]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard");
    } catch (error) {
      toast({
        type: "error",
        title: "Sign In Failed",
        description: getAuthErrorMessage(error, "Invalid email or password."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = isSubmitting || oauthActive;

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080A09]">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/70 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthSplitLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-[28px] font-light tracking-tight mb-2 text-white leading-tight">
            Welcome back
          </h2>
          <p className="text-[14px] text-white/40 font-light">
            Sign in to your private space.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Email Field */}
          <div className="flex flex-col">
            <label
              htmlFor="login-email"
              className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2.5 font-medium"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={`w-full bg-transparent border-0 border-b pb-2.5 text-[15px] text-white focus:ring-0 transition-colors outline-none placeholder:text-white/20 ${
                errors.email ? "border-red-400/70" : "border-white/10 focus:border-white/30"
              }`}
              placeholder="name@example.com"
              disabled={isDisabled}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[10px] text-red-400/80 mt-1.5 tracking-wide">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col">
            <label
              htmlFor="login-password"
              className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2.5 font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                maxLength={128}
                className={`w-full bg-transparent border-0 border-b pb-2.5 text-[15px] text-white focus:ring-0 transition-colors outline-none placeholder:text-white/20 pr-14 ${
                  errors.password ? "border-red-400/70" : "border-white/10 focus:border-white/30"
                }`}
                placeholder="••••••••"
                disabled={isDisabled}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 text-white/30 hover:text-white/60 text-[10px] uppercase tracking-[0.12em] font-medium transition-colors pb-2.5"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-400/80 mt-1.5 tracking-wide">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me + Forgot password row */}
          <div className="flex items-center justify-between pt-1">
            <label
              htmlFor="login-remember"
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <input
                id="login-remember"
                type="checkbox"
                className="w-3.5 h-3.5 rounded-sm border border-white/15 bg-transparent checked:bg-white/90 checked:border-white/90 focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none relative
                  after:content-[''] after:absolute after:inset-0 after:flex after:items-center after:justify-center
                  checked:after:content-['✓'] after:text-[9px] after:font-bold after:text-black after:leading-none"
              />
              <span className="text-[12px] text-white/35 group-hover:text-white/50 transition-colors">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-white/35 hover:text-white/60 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full h-[46px] mt-2 bg-white/90 text-[#080A09] rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-white/90"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black/15 border-t-black/70 rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <OAuthButtons mode="signin" disabled={isDisabled} onLoadingChange={setOauthActive} />

        {/* Sign Up Footer */}
        <div className="mt-10 text-center">
          <p className="text-[13px] text-white/30">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-white/60 hover:text-white transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
