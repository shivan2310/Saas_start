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

  try {
    const decrypted = await decryptJournalPayload(entry.content, userId);
    return {
      ...entry,
      title: decrypted.title || entry.title,
      content: decrypted.content,
    };
  } catch (err) {
    console.warn("Could not decrypt diary entry:", entry.id, err);
    return {
      ...entry,
      title: entry.title && entry.title !== "Encrypted journal entry" ? entry.title : "Journal Entry",
      content: "[Encrypted entry]",
    };
  }
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

    try {
      const { data, error } = await supabase
        .from("diary")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });
      if (error) return;
      const entries = (data || []) as DiaryEntry[];

      const entriesToSecure = entries.filter(
        (entry) => !isEncryptedJournalContent(entry.content)
      );

      await Promise.allSettled(
        entriesToSecure.map(async (entry) => {
          try {
            const encryptedContent = await encryptJournalPayload(
              { title: entry.title, content: entry.content },
              userId
            );
            await supabase
              .from("diary")
              .update({ content: encryptedContent })
              .eq("id", entry.id);
          } catch {
            // Silently continue
          }
        })
      );
    } catch {
      // Non-critical background migration
    }
  },

  async addDiaryEntry(userId: string, title: string, content: string): Promise<DiaryEntry> {
    let encryptedContent = content;
    try {
      encryptedContent = await encryptJournalPayload({ title, content }, userId);
    } catch (cryptoErr) {
      console.warn("Client encryption failed, saving plain content:", cryptoErr);
    }

    const storedTitle = title.trim() || "Untitled entry";
    const { data, error } = await supabase
      .from("diary")
      .insert({ userId, title: storedTitle, content: encryptedContent })
      .select()
      .single();
    if (error) throw error;

    try {
      return await decryptDiaryEntry(data as DiaryEntry, userId);
    } catch {
      return {
        ...(data as DiaryEntry),
        title,
        content,
      };
    }
  },

  async updateDiaryEntry(
    id: string,
    userId: string,
    title: string,
    content: string
  ): Promise<DiaryEntry> {
    let encryptedContent = content;
    try {
      encryptedContent = await encryptJournalPayload({ title, content }, userId);
    } catch (cryptoErr) {
      console.warn("Client encryption failed, saving plain content:", cryptoErr);
    }

    const storedTitle = title.trim() || "Untitled entry";
    const { data, error } = await supabase
      .from("diary")
      .update({ title: storedTitle, content: encryptedContent })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    try {
      return await decryptDiaryEntry(data as DiaryEntry, userId);
    } catch {
      return {
        ...(data as DiaryEntry),
        title,
        content,
      };
    }
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    const { error } = await supabase.from("diary").delete().eq("id", id);
    if (error) throw error;
  },
};
