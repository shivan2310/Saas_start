import { supabase } from "@/supabase/client";
import {
  decryptJournalPayload,
  encryptJournalPayload,
  getJournalEncryptionKeyType,
  hasUnlockedJournalKey,
  isEncryptedJournalContent,
} from "@/lib/journalCrypto";
import { DiaryEntry, Expense, ImportantDate } from "@/types";

export const personalService = {
  async getExpenses(userId: string): Promise<Expense[]> { return getCollection<Expense>("expenses", userId); },
  async addExpense(userId: string, description: string, amount: number, category: string): Promise<Expense> { return add<Expense>("expenses", { userId, description, amount, category }); },
  async getDates(userId: string): Promise<ImportantDate[]> { return getCollection<ImportantDate>("importantDates", userId); },
  async addDate(userId: string, title: string, date: string, notes: string): Promise<ImportantDate> { return add<ImportantDate>("importantDates", { userId, title, date, notes }); },
  async getDiary(userId: string): Promise<DiaryEntry[]> {
    const entries = await getCollection<DiaryEntry>("diary", userId);
    return Promise.all(entries.map((entry) => decryptDiaryEntry(entry, userId)));
  },
  async encryptPlainDiaryEntries(userId: string): Promise<void> {
    if (!hasUnlockedJournalKey(userId)) {
      return;
    }

    const entries = await getCollection<DiaryEntry>("diary", userId);
    const entriesToSecure = entries.filter(
      (entry) => getJournalEncryptionKeyType(entry.content) !== "account"
    );

    await Promise.all(
      entriesToSecure.map(async (entry) => {
        const payload = isEncryptedJournalContent(entry.content)
          ? await decryptJournalPayload(entry.content, userId)
          : { title: entry.title, content: entry.content };
        const encryptedContent = await encryptJournalPayload(
          payload,
          userId
        );
        const { error } = await supabase
          .from("diary")
          .update({ title: "Encrypted journal entry", content: encryptedContent })
          .eq("id", entry.id);
        if (error) throw error;
      })
    );
  },
  async addDiaryEntry(userId: string, title: string, content: string): Promise<DiaryEntry> {
    const encryptedContent = await encryptJournalPayload({ title, content }, userId);
    const storedTitle = "Encrypted journal entry";
    const entry = await add<DiaryEntry>("diary", { userId, title: storedTitle, content: encryptedContent });
    return decryptDiaryEntry(entry, userId);
  },
  async updateDiaryEntry(id: string, userId: string, title: string, content: string): Promise<DiaryEntry> {
    const encryptedContent = await encryptJournalPayload({ title, content }, userId);
    const storedTitle = "Encrypted journal entry";
    const { data, error } = await supabase.from("diary").update({ title: storedTitle, content: encryptedContent }).eq("id", id).select().single();
    if (error) throw error;
    return decryptDiaryEntry(data as DiaryEntry, userId);
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

async function decryptDiaryEntry(
  entry: DiaryEntry,
  userId: string
): Promise<DiaryEntry> {
  if (!isEncryptedJournalContent(entry.content)) {
    return entry;
  }

  const decrypted = await decryptJournalPayload(entry.content, userId);
  return {
    ...entry,
    title: decrypted.title,
    content: decrypted.content,
  };
}
