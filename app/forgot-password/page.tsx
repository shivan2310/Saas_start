"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validations/auth";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsSubmitting(true);
    try {
      await authService.resetPassword(data.email);
      setIsSubmitted(true);
      toast({
        type: "success",
        title: "Reset Email Sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error("Password reset failed:", error);
      toast({
        type: "error",
        title: "Error",
        description: "Failed to send reset email. Please check your address.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-dash-background px-4 py-12">
      <Link
        href="/login"
        className="mb-8 inline-flex items-center text-xs font-medium text-dash-text-muted hover:text-dash-text transition-dash"
      >
        <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to sign in
      </Link>

      <div className="w-full max-w-md">
        <Card className="border-dash-border">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              {isSubmitted
                ? "We sent a password reset link to your email."
                : "Enter your registered email address to receive a reset link."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-dash-surface border border-dash-border text-dash-text flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-xs text-dash-text-muted leading-relaxed">
                  If an account exists with that email, you will receive instructions to reset your password shortly.
                </p>
                <Button variant="dash-secondary" className="w-full" onClick={() => setIsSubmitted(false)}>
                  Resend Link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t border-dash-border mt-4 pt-4">
            <p className="text-xs text-dash-text-muted">
              Remember your password?{" "}
              <Link href="/login" className="text-dash-text font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
