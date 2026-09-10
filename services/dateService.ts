import { supabase } from "@/supabase/client";
import { ImportantDate } from "@/types";

export const dateService = {
  async getDates(userId: string): Promise<ImportantDate[]> {
    const { data, error } = await supabase
      .from("importantDates")
      .select("*")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });
    if (error) throw error;
    return (data || []) as ImportantDate[];
  },

  async addDate(
    userId: string,
    title: string,
    date: string,
    notes: string
  ): Promise<ImportantDate> {
    const { data, error } = await supabase
      .from("importantDates")
      .insert({ userId, title, date, notes })
      .select()
      .single();
    if (error) throw error;
    return data as ImportantDate;
  },

  async deleteDate(id: string): Promise<void> {
    const { error } = await supabase.from("importantDates").delete().eq("id", id);
    if (error) throw error;
  },
};
