import { supabase } from "@/supabase/client";
import {
  decryptJournalPayload,
  encryptJournalPayload,
  getJournalEncryptionKeyType,
  hasUnlockedJournalKey,
  isEncryptedJournalContent,
} from "@/lib/journalCrypto";
import { DiaryEntry } from "@/types";

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

export const diaryService = {
  async getDiary(userId: string): Promise<DiaryEntry[]> {
    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    const entries = (data || []) as DiaryEntry[];
    return Promise.all(entries.map((entry) => decryptDiaryEntry(entry, userId)));
  },

  async encryptPlainDiaryEntries(userId: string): Promise<void> {
    if (!hasUnlockedJournalKey(userId)) {
      return;
    }

    const { data, error } = await supabase
      .from("diary")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    const entries = (data || []) as DiaryEntry[];

    const entriesToSecure = entries.filter(
      (entry) => getJournalEncryptionKeyType(entry.content) !== "account"
    );

    await Promise.all(
      entriesToSecure.map(async (entry) => {
        const payload = isEncryptedJournalContent(entry.content)
          ? await decryptJournalPayload(entry.content, userId)
          : { title: entry.title, content: entry.content };
        const encryptedContent = await encryptJournalPayload(payload, userId);
        const { error: updateError } = await supabase
          .from("diary")
          .update({ title: "Encrypted journal entry", content: encryptedContent })
          .eq("id", entry.id);
        if (updateError) throw updateError;
      })
    );
  },

  async addDiaryEntry(userId: string, title: string, content: string): Promise<DiaryEntry> {
    const encryptedContent = await encryptJournalPayload({ title, content }, userId);
    const storedTitle = "Encrypted journal entry";
    const { data, error } = await supabase
      .from("diary")
      .insert({ userId, title: storedTitle, content: encryptedContent })
      .select()
      .single();
    if (error) throw error;
    return decryptDiaryEntry(data as DiaryEntry, userId);
  },

  async updateDiaryEntry(
    id: string,
    userId: string,
    title: string,
    content: string
  ): Promise<DiaryEntry> {
    const encryptedContent = await encryptJournalPayload({ title, content }, userId);
    const storedTitle = "Encrypted journal entry";
    const { data, error } = await supabase
      .from("diary")
      .update({ title: storedTitle, content: encryptedContent })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return decryptDiaryEntry(data as DiaryEntry, userId);
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    const { error } = await supabase.from("diary").delete().eq("id", id);
    if (error) throw error;
  },
};
