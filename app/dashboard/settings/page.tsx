"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userService } from "@/services/userService";
import { authService } from "@/services/authService";
import { supabase } from "@/supabase/client";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { User, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const SECTIONS = [
  "Profile",
  "Account",
  "Appearance",
] as const;

type Section = typeof SECTIONS[number];

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [activeSection, setActiveSection] = useState<Section>("Profile");
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [isSaving, setIsSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { display_name: displayName } });
      if (error) throw error;
      await userService.updateUserProfile(user.uid, { displayName, photoURL });
      await refreshProfile();
      toast({ type: "success", title: "Profile Updated", description: "Your profile has been saved." });
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
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h2 className="text-[28px] font-semibold tracking-tight text-dash-text">Settings & Profile</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left Navigation */}
        <nav className="w-full md:w-48 shrink-0 flex flex-col space-y-1">
          {SECTIONS.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={cn(
                "text-left px-3 py-2 rounded-md text-[13px] font-medium transition-dash",
                activeSection === section 
                  ? "bg-dash-card text-dash-text" 
                  : "text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover"
              )}
            >
              {section}
            </button>
          ))}
        </nav>

        {/* Right Content */}
        <div className="flex-1 max-w-xl">
          {activeSection === "Profile" && (
            <div className="space-y-6">
              <div className="border-b border-dash-border pb-4">
                <h3 className="text-[16px] font-medium text-dash-text">Public Profile</h3>
                <p className="text-[13px] text-dash-text-muted mt-1">This is how others will see you on the platform.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-dash-card border border-dash-border shrink-0">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dash-text-muted">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-dash-text-secondary uppercase tracking-wider block mb-2">Profile Picture</label>
                    <div className="flex gap-2">
                      <Button type="button" variant="dash-secondary" size="dash-sm" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        Upload Image
                      </Button>
                      {photoURL && (
                        <Button type="button" variant="dash-secondary" size="dash-sm" onClick={() => setPhotoURL("")}>
                          Remove
                        </Button>
                      )}
                      <input 
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-dash-text-secondary uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-dash-surface border border-dash-border rounded-md px-3 py-2 text-[14px] text-dash-text focus:outline-none focus:border-dash-accent transition-dash"
                  />
                </div>
                <Button type="submit" variant="dash-primary" size="dash-sm" isLoading={isSaving}>
                  Save profile
                </Button>
              </form>
            </div>
          )}

          {activeSection === "Account" && (
            <div className="space-y-6">
              <div className="border-b border-dash-border pb-4">
                <h3 className="text-[16px] font-medium text-dash-text">Account Settings</h3>
                <p className="text-[13px] text-dash-text-muted mt-1">Manage your account credentials and personal data.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-medium text-dash-text-secondary uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-dash-background border border-dash-border rounded-md px-3 py-2 text-[14px] text-dash-text-muted cursor-not-allowed"
                  />
                  <p className="text-[11px] text-dash-text-muted">Email cannot be changed directly.</p>
                </div>
              </div>

              <div className="border-t border-dash-border pt-6 mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-dash-card border border-dash-border rounded-md gap-4">
                  <div>
                    <h4 className="text-[14px] font-medium text-dash-text">Password Reset</h4>
                    <p className="text-[12px] text-dash-text-muted mt-0.5">Receive a secure link to update your account password.</p>
                  </div>
                  <Button
                    variant="dash-secondary"
                    size="dash-sm"
                    onClick={handlePasswordReset}
                    isLoading={sendingReset}
                  >
                    Reset Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "Appearance" && (
            <div className="space-y-6">
              <div className="border-b border-dash-border pb-4">
                <h3 className="text-[16px] font-medium text-dash-text">Appearance & Theme</h3>
                <p className="text-[13px] text-dash-text-muted mt-1">
                  Customize the interface theme to your personal preference.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Light Mode Card */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "relative flex flex-col items-start p-4 rounded-lg border text-left transition-dash",
                    theme === "light"
                      ? "border-dash-accent bg-dash-card shadow-sm ring-1 ring-dash-accent"
                      : "border-dash-border bg-dash-surface hover:border-dash-accent/50 hover:bg-dash-hover"
                  )}
                >
                  <div className="flex w-full items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
                        <Sun className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-semibold text-dash-text">Light</span>
                    </div>
                    {theme === "light" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dash-accent text-white text-xs">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-dash-text-muted">
                    Crisp, clean off-white interface optimal for bright daylight environments.
                  </p>
                  <div className="mt-4 w-full h-12 rounded border border-dash-border bg-[#F8F9FA] p-2 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                    <div className="h-2 w-16 bg-gray-200 rounded" />
                    <div className="h-2 w-8 bg-[#2D6A4F] rounded ml-auto" />
                  </div>
                </button>

                {/* Dark Mode Card */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "relative flex flex-col items-start p-4 rounded-lg border text-left transition-dash",
                    theme === "dark"
                      ? "border-dash-accent bg-dash-card shadow-sm ring-1 ring-dash-accent"
                      : "border-dash-border bg-dash-surface hover:border-dash-accent/50 hover:bg-dash-hover"
                  )}
                >
                  <div className="flex w-full items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-emerald-500/10 text-[#8FAFA5]">
                        <Moon className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-semibold text-dash-text">Dark</span>
                    </div>
                    {theme === "dark" && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dash-accent text-dash-background text-xs">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-dash-text-muted">
                    Sleek, low-contrast dark interface tailored for night focus and OLED displays.
                  </p>
                  <div className="mt-4 w-full h-12 rounded border border-dash-border bg-[#0D0F10] p-2 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#151718] border border-[#292C2D]" />
                    <div className="h-2 w-16 bg-[#202223] rounded" />
                    <div className="h-2 w-8 bg-[#8FAFA5] rounded ml-auto" />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
