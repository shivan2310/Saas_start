import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { DiaryEntry, Expense, ImportantDate } from "@/types";

const dateValue = (value: any) => value?.toDate?.()?.toISOString() || new Date().toISOString();

export const personalService = {
  async getExpenses(userId: string): Promise<Expense[]> {
    const snap = await getDocs(query(collection(db, "expenses"), where("userId", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), amount: Number(d.data().amount), createdAt: dateValue(d.data().createdAt) } as Expense));
  },
  async addExpense(userId: string, description: string, amount: number, category: string): Promise<Expense> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, "expenses"), { userId, description, amount, category, createdAt: serverTimestamp() });
    return { id: ref.id, userId, description, amount, category, createdAt };
  },
  async getDates(userId: string): Promise<ImportantDate[]> {
    const snap = await getDocs(query(collection(db, "importantDates"), where("userId", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: dateValue(d.data().createdAt) } as ImportantDate));
  },
  async addDate(userId: string, title: string, date: string, notes: string): Promise<ImportantDate> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, "importantDates"), { userId, title, date, notes, createdAt: serverTimestamp() });
    return { id: ref.id, userId, title, date, notes, createdAt };
  },
  async getDiary(userId: string): Promise<DiaryEntry[]> {
    const snap = await getDocs(query(collection(db, "diary"), where("userId", "==", userId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: dateValue(d.data().createdAt) } as DiaryEntry));
  },
  async addDiaryEntry(userId: string, title: string, content: string): Promise<DiaryEntry> {
    const createdAt = new Date().toISOString();
    const ref = await addDoc(collection(db, "diary"), { userId, title, content, createdAt: serverTimestamp() });
    return { id: ref.id, userId, title, content, createdAt };
  },
  async remove(collectionName: string, id: string) { await deleteDoc(doc(db, collectionName, id)); },
};
