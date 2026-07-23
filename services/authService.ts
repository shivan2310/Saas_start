import { auth } from "@/firebase/config";
import { getActionCodeSettings } from "@/firebase/actionCodeSettings";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
} from "firebase/auth";
import { userService } from "./userService";
import { UserProfile } from "@/types";

export const authService = {
  /**
   * Register a new user with email, password, and display name
   */
  async register(email: string, password: string, name: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    const profile = await userService.createUserProfile(user.uid, email, name);

    await sendEmailVerification(user, getActionCodeSettings("/dashboard"));

    return profile;
  },

  /**
   * Log in user with email & password
   */
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  /**
   * Log out user
   */
  async logout(): Promise<void> {
    await firebaseSignOut(auth);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email, getActionCodeSettings("/login"));
  },

  /**
   * Resend email verification
   */
  async sendVerificationEmail(user: User): Promise<void> {
    await sendEmailVerification(user, getActionCodeSettings("/dashboard"));
  },
};
