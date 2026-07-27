import { supabase } from "@/supabase/client";
import { UserProfile, UserRole } from "@/types";

export const userService = {
  async createUserProfile(uid: string, email: string, name: string, role: UserRole = "user"): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profile = { uid, email, displayName: name, photoURL: null, role, emailVerified: false, createdAt: now, updatedAt: now };
    const { data, error } = await supabase.from("users").upsert(profile, { onConflict: "uid" }).select().single();
    if (error) throw error;
    return normalize(data);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("users").select("*").eq("uid", uid).maybeSingle();
    if (error) throw error;
    return data ? normalize(data) : null;
  },

  async updateUserProfile(uid: string, updates: Partial<Pick<UserProfile, "displayName" | "photoURL">>): Promise<void> {
    const { error } = await supabase.from("users").update({ ...updates, updatedAt: new Date().toISOString() }).eq("uid", uid);
    if (error) throw error;
  },
};

function normalize(data: Record<string, any>): UserProfile {
  return { uid: data.uid, email: data.email || "", displayName: data.displayName || null, photoURL: data.photoURL || null, role: data.role || "user", createdAt: data.createdAt || new Date().toISOString(), updatedAt: data.updatedAt || new Date().toISOString(), emailVerified: Boolean(data.emailVerified) };
}
