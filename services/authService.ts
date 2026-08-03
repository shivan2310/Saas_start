import { supabase } from "@/supabase/client";
import { AuthUser } from "@/types/auth";
import { UserProfile } from "@/types";
import { emailSchema } from "@/lib/validations/auth";

const appUrl = () =>
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const mapUser = (user: { id: string; email?: string; user_metadata?: Record<string, unknown>; email_confirmed_at?: string | null }): AuthUser => ({
  uid: user.id,
  email: user.email || null,
  displayName: (user.user_metadata?.display_name as string) || null,
  photoURL: (user.user_metadata?.avatar_url as string) || null,
  emailVerified: Boolean(user.email_confirmed_at),
});

export const authService = {
  async register(email: string, password: string, name: string): Promise<UserProfile> {
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      throw new Error(parsedEmail.error.issues[0]?.message || "Invalid email address");
    }

    const normalizedEmail = parsedEmail.data.toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: { display_name: name }, emailRedirectTo: `${appUrl()}/dashboard` },
    });
    if (error) throw error;
    if (!data.user) throw new Error("Account could not be created.");
    // The database trigger in supabase/schema.sql creates the profile atomically.
    return {
      uid: data.user.id, email: normalizedEmail, displayName: name, photoURL: null, role: "user",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), emailVerified: false,
    };
  },

  async login(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return mapUser(data.user);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user ? mapUser(data.user) : null;
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl()}/login`,
    });
    if (error) throw error;
  },

  async sendVerificationEmail(user: AuthUser): Promise<void> {
    if (!user.email) throw new Error("No email address is associated with this account.");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
      options: { emailRedirectTo: `${appUrl()}/dashboard` },
    });
    if (error) throw error;
  },

  mapUser,
};
