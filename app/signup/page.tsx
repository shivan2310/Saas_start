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
  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
      // Browser will redirect — no further action needed
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
            Create account
          </h2>
          <p className="text-dash-text-secondary font-light">
            Create your private space for everyday life.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
          <div className="space-y-8">
            {/* Name Field */}
            <div className="flex flex-col group">
              <label
                htmlFor="signup-name"
                className="text-[10px] uppercase tracking-widest text-dash-text-muted mb-3 font-semibold"
              >
                First Name
              </label>
              <input
                id="signup-name"
                type="text"
                maxLength={100}
                autoComplete="given-name"
                className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="Mark"
                disabled={isDisabled}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 mt-1.5 uppercase tracking-wide">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col group">
              <label
                htmlFor="signup-email"
                className="text-[10px] uppercase tracking-widest text-dash-text-muted mb-3 font-semibold"
              >
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled ${
                  errors.email ? "border-red-500" : ""
                }`}
                placeholder="mark.johnson@example.com"
                disabled={isDisabled}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 mt-1.5 uppercase tracking-wide">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col group">
              <label
                htmlFor="signup-password"
                className="text-[10px] uppercase tracking-widest text-dash-text-muted mb-3 font-semibold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  maxLength={128}
                  autoComplete="new-password"
                  className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled pr-12 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="Create a strong password"
                  disabled={isDisabled}
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
              {errors.password ? (
                <p className="text-[10px] text-red-500 mt-1.5 uppercase tracking-wide">{errors.password.message}</p>
              ) : (
                <p className="text-[10px] text-dash-text-muted mt-1.5 uppercase tracking-wide">Must be 8+ chars with 1 uppercase &amp; 1 number</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-dash-text-muted">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-white hover:underline transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-white hover:underline transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Create Account Button — Pill-shaped */}
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full h-12 bg-white text-black rounded-full text-[11px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:hover:bg-white"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* OAuth Divider */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-dash-border/40" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#090D0B] px-4 text-[10px] uppercase tracking-widest text-dash-text-muted font-semibold">
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
            className="w-full h-12 rounded-full border border-dash-border/50 bg-transparent text-dash-text text-[11px] uppercase tracking-widest font-semibold hover:border-dash-border hover:bg-white/[0.03] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {oauthLoading === "google" ? (
              <div className="w-4 h-4 border-2 border-dash-border/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {oauthLoading === "google" ? "Redirecting…" : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={() => handleOAuth("apple")}
            disabled={isDisabled}
            className="w-full h-12 rounded-full border border-dash-border/50 bg-transparent text-dash-text text-[11px] uppercase tracking-widest font-semibold hover:border-dash-border hover:bg-white/[0.03] transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {oauthLoading === "apple" ? (
              <div className="w-4 h-4 border-2 border-dash-border/30 border-t-white rounded-full animate-spin" />
            ) : (
              <AppleIcon />
            )}
            {oauthLoading === "apple" ? "Redirecting…" : "Continue with Apple"}
          </button>
        </div>
      </div>

      {/* Sign In Navigation */}
      <div className="absolute bottom-12 right-0 left-0 text-center md:text-left md:left-[50%] md:pl-16 lg:pl-24">
        <p className="text-[13px] text-dash-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-white hover:underline underline-offset-4 transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
