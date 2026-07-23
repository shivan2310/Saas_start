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

type FirebaseAuthError = {
  code?: string;
};

async function sendVerificationEmailWithFallback(user: User): Promise<void> {
  try {
    await sendEmailVerification(user, getActionCodeSettings("/dashboard"));
  } catch (error) {
    const code = (error as FirebaseAuthError).code;
    if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
      await sendEmailVerification(user);
      return;
    }
    throw error;
  }
}

async function sendPasswordResetWithFallback(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email, getActionCodeSettings("/login"));
  } catch (error) {
    const code = (error as FirebaseAuthError).code;
    if (code === "auth/unauthorized-continue-uri" || code === "auth/invalid-continue-uri") {
      await sendPasswordResetEmail(auth, email);
      return;
    }
    throw error;
  }
}

export const authService = {
  /**
   * Register a new user with email, password, and display name
   */
  async register(email: string, password: string, name: string): Promise<UserProfile> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    await sendVerificationEmailWithFallback(user);

    try {
      return await userService.createUserProfile(user.uid, email, name);
    } catch (error) {
      console.error("Failed to create Firestore profile after signup:", error);
      return {
        uid: user.uid,
        email,
        displayName: name,
        photoURL: null,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
      };
    }
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
    await sendPasswordResetWithFallback(email);
  },

  /**
   * Resend email verification
   */
  async sendVerificationEmail(user: User): Promise<void> {
    await sendVerificationEmailWithFallback(user);
  },
};
