"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import { Users, Shield, Calendar, MailCheck, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, profile, isEmailVerified } = useAuth();
  const { toast } = useToast();
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleResendVerification = async () => {
    if (!user) return;
    setSendingVerification(true);
    try {
      await authService.sendVerificationEmail(user);
      toast({
        type: "success",
        title: "Verification Email Sent",
        description: "Please check your inbox to confirm your email.",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      toast({
        type: "error",
        title: "Error",
        description: getAuthErrorMessage(
          error,
          "Could not send verification email. Try again later."
        ),
      });
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <div className="rounded border border-black bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-black shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-black">Email Verification Pending</h4>
              <p className="text-xs text-muted">
                Please verify your email address (<strong>{user?.email}</strong>) to secure your account.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="default"
            onClick={handleResendVerification}
            isLoading={sendingVerification}
            className="shrink-0"
          >
            Resend Email
          </Button>
        </div>
      )}

      {/* Greeting Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">
          Welcome back, {profile?.displayName || "User"}
        </h2>
        <p className="text-xs text-muted mt-1">
          Keep your day, money, memories, and important dates close at hand.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
              Your space
            </CardTitle>
            <Shield className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black capitalize">{profile?.role || "User"}</div>
            <p className="text-[11px] text-muted mt-1">Private to your account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
              Your Nivio
            </CardTitle>
            <MailCheck className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {isEmailVerified ? "Verified" : "Unverified"}
            </div>
            <p className="text-[11px] text-muted mt-1">Ready for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
              Important dates
            </CardTitle>
            <Calendar className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">
              {profile?.createdAt ? formatDate(profile.createdAt) : "Today"}
            </div>
            <p className="text-[11px] text-muted mt-1">Never miss what matters</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
