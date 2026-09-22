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
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthActive, setOauthActive] = useState(false);
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

        <OAuthButtons mode="signup" disabled={isDisabled} onLoadingChange={setOauthActive} />

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
