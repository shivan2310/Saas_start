"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";

const GoogleIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && !isSubmitting) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, authLoading, isSubmitting, router]);

  const onSubmit = async (data: SignupInput) => {
    setIsSubmitting(true);
    try {
      await authService.register(data.email, data.password, data.name);
      toast({
        type: "success",
        title: "Account Created",
        description: "A verification email has been sent. Check your inbox and spam folder.",
      });
      router.push("/verify-email");
    } catch (error) {
      console.error("Signup failed:", error);
      try {
        await authService.logout();
      } catch (logoutError) {
        console.error("Failed to clean up partial signup:", logoutError);
      }
      toast({
        type: "error",
        title: "Registration Error",
        description: getAuthErrorMessage(error, "Failed to create account. Please try again."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    try {
      await authService.loginWithProvider(provider);
    } catch (error) {
      toast({
        type: "error",
        title: "Sign Up Failed",
        description: getAuthErrorMessage(error, `Could not connect to ${provider === "google" ? "Google" : "Apple"}.`),
      });
      setOauthLoading(null);
    }
  };

  const isDisabled = isSubmitting || oauthLoading !== null;

  if (authLoading || isAuthenticated) {
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
            Create account
          </h2>
          <p className="text-[14px] text-white/40 font-light">
            Create your private space for everyday life.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Name Field */}
          <div className="flex flex-col">
            <label
              htmlFor="signup-name"
              className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2.5 font-medium"
            >
              First Name
            </label>
            <input
              id="signup-name"
              type="text"
              maxLength={100}
              autoComplete="given-name"
              className={`w-full bg-transparent border-0 border-b pb-2.5 text-[15px] text-white focus:ring-0 transition-colors outline-none placeholder:text-white/20 ${
                errors.name ? "border-red-400/70" : "border-white/10 focus:border-white/30"
              }`}
              placeholder="Mark"
              disabled={isDisabled}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-[10px] text-red-400/80 mt-1.5 tracking-wide">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label
              htmlFor="signup-email"
              className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2.5 font-medium"
            >
              Email
            </label>
            <input
              id="signup-email"
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
              htmlFor="signup-password"
              className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2.5 font-medium"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                maxLength={128}
                autoComplete="new-password"
                className={`w-full bg-transparent border-0 border-b pb-2.5 text-[15px] text-white focus:ring-0 transition-colors outline-none placeholder:text-white/20 pr-14 ${
                  errors.password ? "border-red-400/70" : "border-white/10 focus:border-white/30"
                }`}
                placeholder="Create a strong password"
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
            {errors.password ? (
              <p className="text-[10px] text-red-400/80 mt-1.5 tracking-wide">{errors.password.message}</p>
            ) : (
              <p className="text-[10px] text-white/20 mt-1.5 tracking-wide">8+ chars, 1 uppercase, 1 number</p>
            )}
          </div>

          {/* Terms */}
          <div className="pt-1">
            <p className="text-[11px] text-white/25 leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-white/45 hover:text-white/70 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-white/45 hover:text-white/70 transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full h-[46px] mt-1 bg-white/90 text-[#080A09] rounded-full text-[11px] uppercase tracking-[0.18em] font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-white/90"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-black/15 border-t-black/70 rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#080A09] px-4 text-[10px] uppercase tracking-[0.15em] text-white/25 font-medium">
              Or sign up with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth("google")}
            disabled={isDisabled}
            className="w-full h-[46px] rounded-full border border-white/[0.08] bg-transparent text-white/70 text-[12px] tracking-wide font-medium hover:border-white/15 hover:text-white/90 hover:bg-white/[0.02] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40"
          >
            {oauthLoading === "google" ? (
              <div className="w-4 h-4 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={isDisabled}
            className="w-full h-[46px] rounded-full border border-white/[0.08] bg-transparent text-white/70 text-[12px] tracking-wide font-medium hover:border-white/15 hover:text-white/90 hover:bg-white/[0.02] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-40"
          >
            {oauthLoading === "apple" ? (
              <div className="w-4 h-4 border-2 border-white/10 border-t-white/60 rounded-full animate-spin" />
            ) : (
              <AppleIcon />
            )}
            {oauthLoading === "apple" ? "Redirecting…" : "Continue with Apple"}
          </button>
        </div>

        {/* Sign In Footer */}
        <div className="mt-8 text-center">
          <p className="text-[13px] text-white/30">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white/60 hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
