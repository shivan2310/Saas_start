"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { supabase } from "@/supabase/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { User, Mail, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const { user, profile, refreshProfile, isEmailVerified } = useAuth();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
      if (error) throw error;
      await userService.updateUserProfile(user.uid, { displayName });
      await refreshProfile();
      toast({ type: "success", title: "Profile Updated", description: "Your display name has been saved." });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ type: "error", title: "Error", description: "Failed to update profile details." });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      await authService.resetPassword(user.email);
      toast({
        type: "success",
        title: "Password Reset Sent",
        description: `Reset link sent to ${user.email}`,
      });
    } catch (error) {
      console.error("Failed to send reset email:", error);
      toast({ type: "error", title: "Error", description: "Failed to dispatch password reset." });
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Profile & Settings</h2>
        <p className="text-xs text-muted mt-1">Manage your account information and security preferences.</p>
      </div>

      {/* Profile Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your public display name and contact profile.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              maxLength={100}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              leftIcon={<User className="h-4 w-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              value={user?.email || ""}
              disabled
              helperText="Email cannot be changed directly."
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </CardContent>
          <CardFooter className="justify-end border-t border-border mt-6 pt-4">
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader>
          <CardTitle>Security & Authentication</CardTitle>
          <CardDescription>Request password updates and view session details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded border border-border bg-surface">
            <div>
              <h4 className="text-xs font-semibold text-black">Password Reset</h4>
              <p className="text-xs text-muted">Receive a secure link to update your account password.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasswordReset}
              isLoading={sendingReset}
              leftIcon={<Key className="h-3.5 w-3.5" />}
            >
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
