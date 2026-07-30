import { supabase } from "@/supabase/client";
import { DiaryEntry, Expense, ImportantDate } from "@/types";

export const personalService = {
  async getExpenses(userId: string): Promise<Expense[]> { return getCollection<Expense>("expenses", userId); },
  async addExpense(userId: string, description: string, amount: number, category: string): Promise<Expense> { return add<Expense>("expenses", { userId, description, amount, category }); },
  async getDates(userId: string): Promise<ImportantDate[]> { return getCollection<ImportantDate>("importantDates", userId); },
  async addDate(userId: string, title: string, date: string, notes: string): Promise<ImportantDate> { return add<ImportantDate>("importantDates", { userId, title, date, notes }); },
  async getDiary(userId: string): Promise<DiaryEntry[]> { return getCollection<DiaryEntry>("diary", userId); },
  async addDiaryEntry(userId: string, title: string, content: string): Promise<DiaryEntry> { return add<DiaryEntry>("diary", { userId, title, content }); },
  async updateDiaryEntry(id: string, title: string, content: string): Promise<DiaryEntry> {
    const { data, error } = await supabase.from("diary").update({ title, content }).eq("id", id).select().single();
    if (error) throw error;
    return data as DiaryEntry;
  },
  async remove(collectionName: string, id: string) { const { error } = await supabase.from(collectionName).delete().eq("id", id); if (error) throw error; },
};

async function getCollection<T>(table: string, userId: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select("*").eq("userId", userId).order("createdAt", { ascending: false });
  if (error) throw error;
  return (data || []) as T[];
}

async function add<T>(table: string, values: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(values).select().single();
  if (error) throw error;
  return data as T;
}
