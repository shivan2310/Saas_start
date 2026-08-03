"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/supabase/client";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { AuthUser } from "@/types/auth";
import { UserProfile } from "@/types";

interface AuthContextType { user: AuthUser | null; profile: UserProfile | null; loading: boolean; refreshProfile: () => Promise<void>; }
const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, refreshProfile: async () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => setProfile(await userService.getUserProfile(uid));
  const handleSession = async (session: Session | null) => {
    let nextUser = null;

    if (session?.user) {
      try {
        // A cached session can contain the user record from before an email was
        // confirmed. Fetching it from Supabase keeps the verification badge current.
        nextUser = await authService.getCurrentUser();
      } catch (error) {
        console.error("Failed to refresh authenticated user:", error);
        nextUser = authService.mapUser(session.user);
      }
    }

    setUser(nextUser);
    if (nextUser) await fetchProfile(nextUser.uid); else setProfile(null);
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => handleSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { void handleSession(session); });
    return () => listener.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, profile, loading, refreshProfile: async () => { if (user) await fetchProfile(user.uid); } }}>{children}</AuthContext.Provider>;
};
export const useAuthContext = () => useContext(AuthContext);
