import { supabase } from "@/supabase/client";
import { expenseService } from "./expenseService";
import { dateService } from "./dateService";
import { diaryService } from "./diaryService";
import { DiaryEntry, Expense, ImportantDate } from "@/types";

/**
 * Facade service combining personal productivity domains: expenses, dates, and diary entries.
 * Maintains full backward compatibility while delegating to specialized domain services.
 */
export const personalService = {
  // Expense operations
  getExpenses(userId: string): Promise<Expense[]> {
    return expenseService.getExpenses(userId);
  },
  addExpense(
    userId: string,
    description: string,
    amount: number,
    category: string,
    paymentType?: string
  ): Promise<Expense> {
    return expenseService.addExpense(userId, description, amount, category, paymentType);
  },

  // Date operations
  getDates(userId: string): Promise<ImportantDate[]> {
    return dateService.getDates(userId);
  },
  addDate(
    userId: string,
    title: string,
    date: string,
    notes: string
  ): Promise<ImportantDate> {
    return dateService.addDate(userId, title, date, notes);
  },

  // Diary operations
  getDiary(userId: string): Promise<DiaryEntry[]> {
    return diaryService.getDiary(userId);
  },
  encryptPlainDiaryEntries(userId: string): Promise<void> {
    return diaryService.encryptPlainDiaryEntries(userId);
  },
  addDiaryEntry(userId: string, title: string, content: string): Promise<DiaryEntry> {
    return diaryService.addDiaryEntry(userId, title, content);
  },
  updateDiaryEntry(
    id: string,
    userId: string,
    title: string,
    content: string
  ): Promise<DiaryEntry> {
    return diaryService.updateDiaryEntry(id, userId, title, content);
  },

  // Generic remove helper
  async remove(collectionName: string, id: string): Promise<void> {
    const { error } = await supabase.from(collectionName).delete().eq("id", id);
    if (error) throw error;
  },
};
