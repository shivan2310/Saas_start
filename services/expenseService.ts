import { supabase } from "@/supabase/client";
import { Expense } from "@/types";

export const expenseService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return (data || []) as Expense[];
  },

  async addExpense(
    userId: string,
    description: string,
    amount: number,
    category: string,
    paymentType?: string
  ): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .insert({ userId, description, amount, category, paymentType })
      .select()
      .single();
    if (error) throw error;
    return data as Expense;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw error;
  },
};
