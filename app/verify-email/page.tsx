"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const resendEmail = async () => {
    if (!user) return;
    try {
      await authService.sendVerificationEmail(user);
      toast({ type: "success", title: "Verification email sent", description: "Check your inbox and spam folder." });
    } catch (error) {
      toast({ type: "error", title: "Could not send email", description: error instanceof Error ? error.message : "Please try again later." });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border text-center">
        <CardHeader className="items-center space-y-2">
          <Mail className="h-8 w-8" />
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Confirm the link sent to {user?.email || "your email address"} before accessing your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <Button className="w-full" onClick={resendEmail}>Resend verification email</Button>
          ) : !loading ? (
            <Link href="/login" className="text-sm font-medium hover:underline">Sign in to resend the verification email</Link>
          ) : null}
          <p className="text-xs text-muted">After confirming, return here or sign in again to continue.</p>
        </CardContent>
      </Card>
    </main>
  );
}
