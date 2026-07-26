"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { ImportantDate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DatesPage() {
  const { user } = useAuth(); const [items, setItems] = useState<ImportantDate[]>([]); const [title, setTitle] = useState(""); const [date, setDate] = useState(""); const [notes, setNotes] = useState("");
  useEffect(() => { if (user) personalService.getDates(user.uid).then(setItems); }, [user]);
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!user || !title.trim() || !date) return; const item = await personalService.addDate(user.uid, title.trim(), date, notes.trim()); setItems((v) => [...v, item].sort((a, b) => a.date.localeCompare(b.date))); setTitle(""); setDate(""); setNotes(""); };
  const remove = async (id: string) => { await personalService.remove("importantDates", id); setItems((v) => v.filter((item) => item.id !== id)); };
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Important dates</h2><p className="text-xs text-muted mt-1">Remember the moments and appointments that matter.</p></div><Card><CardHeader><CardTitle>Add an important date</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-3 sm:grid-cols-4"><Input label="What is it?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Birthday, appointment..." required /><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required /><Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" /><Button type="submit" className="self-end">Save date</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Your dates</CardTitle></CardHeader><CardContent>{items.length ? items.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-border py-3 text-sm"><span><strong>{item.title}</strong>{item.notes && <span className="ml-2 text-xs text-muted">{item.notes}</span>}</span><span className="flex items-center gap-3 font-semibold">{item.date}<button onClick={() => remove(item.id)} aria-label="Delete date" className="text-muted hover:text-black"><Trash2 className="h-4 w-4" /></button></span></div>) : <p className="text-sm text-muted">No important dates yet.</p>}</CardContent></Card></div>;
}
