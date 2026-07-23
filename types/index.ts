export type UserRole = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
}

export type Priority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  userId: string;
  text: string;
  done: boolean;
  priority: Priority;
  createdAt: string;
}

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
