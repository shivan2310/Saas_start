"use client";

import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, profile, loading, refreshProfile } = useAuthContext();

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isEmailVerified: user?.emailVerified ?? false,
    role: profile?.role || "user",
    refreshProfile,
  };
}
