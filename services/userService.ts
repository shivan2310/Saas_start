import { db } from "@/firebase/config";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { UserProfile, UserRole } from "@/types";

export const userService = {
  /**
   * Create or update user profile in Firestore 'users' collection
   */
  async createUserProfile(
    uid: string,
    email: string,
    name: string,
    role: UserRole = "user"
  ): Promise<UserProfile> {
    const userRef = doc(db, "users", uid);
    const now = new Date().toISOString();

    const userProfile: UserProfile = {
      uid,
      email,
      displayName: name,
      photoURL: null,
      role,
      createdAt: now,
      updatedAt: now,
      emailVerified: false,
    };

    await setDoc(userRef, {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userProfile;
  },

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    return {
      uid: snap.id,
      email: data.email || "",
      displayName: data.displayName || null,
      photoURL: data.photoURL || null,
      role: data.role || "user",
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      emailVerified: data.emailVerified || false,
    };
  },

  /**
   * Update user profile fields
   */
  async updateUserProfile(
    uid: string,
    updates: Partial<Pick<UserProfile, "displayName" | "photoURL">>
  ): Promise<void> {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },
};
