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

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-8">
            {/* Name Field */}
            <div className="flex flex-col group">
              <label
                htmlFor="name"
                className="text-[10px] uppercase tracking-widest text-dash-text-muted mb-3 font-semibold"
              >
                First Name
              </label>
              <input
                id="name"
                type="text"
                maxLength={100}
                className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled ${
                  errors.name ? "border-red-500" : ""
                }`}
                placeholder="Mark"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-[10px] text-red-500 mt-1.5 uppercase tracking-wide">{errors.name.message}</p>
              )}
            </div>

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
                placeholder="mark.johnson@example.com"
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
                  maxLength={128}
                  className={`w-full bg-transparent border-0 border-b border-dash-border pb-3 text-dash-text focus:ring-0 focus:border-white transition-colors outline-none placeholder:text-dash-text-disabled pr-12 ${
                    errors.password ? "border-red-500" : ""
                  }`}
                  placeholder="Create a strong password"
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
                <p className="text-[10px] text-dash-text-muted mt-1.5 uppercase tracking-wide">Must be 8+ chars with 1 uppercase & 1 number</p>
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

          {/* Distinct Circular Submit Button */}
          <div className="absolute -bottom-6 right-0">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-24 h-24 bg-white text-black rounded-full text-[10px] uppercase tracking-widest font-bold hover:scale-105 hover:bg-gray-200 shadow-xl transition-all duration-300 flex items-center justify-center text-center leading-tight disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign<br />Up</>
              )}
            </button>
          </div>
        </form>
      </div>

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
