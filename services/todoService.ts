import { db } from "@/firebase/config";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { TodoItem, Priority } from "@/types";

export const todoService = {
  /**
   * Fetch all todos for a specific user
   */
  async getUserTodos(userId: string): Promise<TodoItem[]> {
    const todosRef = collection(db, "todos");
    const q = query(todosRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    return snap.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        text: data.text,
        done: data.done ?? false,
        priority: data.priority ?? "medium",
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      };
    });
  },

  /**
   * Add a new todo for the user
   */
  async addTodo(userId: string, text: string, priority: Priority = "medium"): Promise<TodoItem> {
    const todosRef = collection(db, "todos");
    const now = new Date().toISOString();
    const docRef = await addDoc(todosRef, {
      userId,
      text,
      done: false,
      priority,
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      userId,
      text,
      done: false,
      priority,
      createdAt: now,
    };
  },

  /**
   * Toggle completion status
   */
  async toggleTodo(todoId: string, done: boolean): Promise<void> {
    const docRef = doc(db, "todos", todoId);
    await updateDoc(docRef, { done });
  },

  /**
   * Delete a todo item
   */
  async deleteTodo(todoId: string): Promise<void> {
    const docRef = doc(db, "todos", todoId);
    await deleteDoc(docRef);
  },
};
