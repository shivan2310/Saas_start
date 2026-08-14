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
  journalKey?: string | null;
}

export type Priority = "low" | "medium" | "high";

export interface TodoItem {
  id: string;
  userId: string;
  text: string;
  done: boolean;
  priority: Priority;
  dueDate: string | null;
  createdAt: string;
}

export interface Expense { id: string; userId: string; description: string; amount: number; category: string; createdAt: string; }
export interface ImportantDate { id: string; userId: string; title: string; date: string; notes: string; createdAt: string; }
export interface DiaryEntry { id: string; userId: string; title: string; content: string; createdAt: string; }

export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
