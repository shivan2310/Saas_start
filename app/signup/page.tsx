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
      <div className="min-h-screen flex items-center justify-center bg-dash-background">
        <div className="w-6 h-6 border-2 border-dash-border border-t-dash-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthSplitLayout>
      <div className="mb-10">
        <h2 className="text-3xl font-light tracking-tight mb-2 text-dash-text">
          Create account
        </h2>
        <p className="text-dash-text-secondary font-light">
          Create your private space for everyday life.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="flex flex-col">
            <label
              htmlFor="name"
              className="text-xs uppercase tracking-widest text-dash-text-muted mb-2 font-medium"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              maxLength={100}
              className={`w-full bg-transparent border-0 border-b border-dash-border pb-2 text-dash-text focus:ring-0 focus:border-dash-text transition-colors outline-none placeholder:text-dash-text-disabled ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="John Doe"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

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
                maxLength={128}
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
            {errors.password ? (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            ) : (
              <p className="text-xs text-dash-text-muted mt-1">Must be 8+ chars with 1 uppercase & 1 number</p>
            )}
          </div>
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
              "Create Account"
            )}
          </button>
        </div>

        <div className="text-center mt-6 space-y-4">
          <p className="text-xs text-dash-text-muted">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-dash-text transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-dash-text transition-colors">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-sm text-dash-text-secondary">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-dash-text hover:underline underline-offset-4 transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthSplitLayout>
  );
}
