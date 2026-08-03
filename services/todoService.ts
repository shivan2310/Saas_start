import { supabase } from "@/supabase/client";
import { TodoItem, Priority } from "@/types";

export const todoService = {
  async getUserTodos(userId: string): Promise<TodoItem[]> {
    const { data, error } = await supabase.from("todos").select("*").eq("userId", userId).order("createdAt", { ascending: false });
    if (error) throw error;
    return (data || []) as TodoItem[];
  },
  async addTodo(userId: string, text: string, priority: Priority = "medium", dueDate?: string): Promise<TodoItem> {
    const { data, error } = await supabase.from("todos").insert({ userId, text, done: false, priority, dueDate: dueDate || null }).select().single();
    if (error) throw error;
    return data as TodoItem;
  },
  async toggleTodo(todoId: string, done: boolean): Promise<void> {
    const { error } = await supabase.from("todos").update({ done }).eq("id", todoId);
    if (error) throw error;
  },
  async deleteTodo(todoId: string): Promise<void> {
    const { error } = await supabase.from("todos").delete().eq("id", todoId);
    if (error) throw error;
  },
};
