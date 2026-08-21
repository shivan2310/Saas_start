"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { ArrowLeft, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <main className="min-h-screen flex flex-col justify-center items-center bg-dash-background px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-xs font-medium text-dash-text-muted hover:text-dash-text transition-dash"
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to home
      </Link>

      <div className="w-full max-w-md">
        <Card className="border-dash-border">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="sr-only">Password</span>
                </div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />
                <div className="text-right mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-dash-text-muted hover:text-dash-text font-medium transition-dash"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Sign In
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-dash-border mt-4 pt-4">
            <p className="text-xs text-dash-text-muted">
              Don't have an account?{" "}
              <Link href="/signup" className="text-dash-text font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
