"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupInput } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/lib/firebase/authErrors";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Lock, Mail, User } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      router.push("/dashboard");
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-border border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center text-xs font-medium text-muted hover:text-black transition-colors"
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to home
      </Link>

      <div className="w-full max-w-md">
        <Card className="border-border">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Get started with your free SaaS starter template</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                helperText="Must be 8+ chars with 1 uppercase & 1 number"
                leftIcon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register("password")}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Create Account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border mt-4 pt-4">
            <p className="text-xs text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
