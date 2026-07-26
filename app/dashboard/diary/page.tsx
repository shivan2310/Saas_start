"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { DiaryEntry } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DiaryPage() {
  const { user } = useAuth(); const [items, setItems] = useState<DiaryEntry[]>([]); const [title, setTitle] = useState(""); const [content, setContent] = useState("");
  useEffect(() => { if (user) personalService.getDiary(user.uid).then(setItems); }, [user]);
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!user || !content.trim()) return; const item = await personalService.addDiaryEntry(user.uid, title.trim() || "Untitled entry", content.trim()); setItems((v) => [item, ...v]); setTitle(""); setContent(""); };
  const remove = async (id: string) => { await personalService.remove("diary", id); setItems((v) => v.filter((item) => item.id !== id)); };
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Diary</h2><p className="text-xs text-muted mt-1">A private place for your thoughts and daily reflections.</p></div><Card><CardHeader><CardTitle>Write an entry</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-3"><Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="How was your day?" /><textarea aria-label="Diary entry" className="min-h-32 w-full rounded border border-border bg-white p-3 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write whatever is on your mind..." required /><Button type="submit">Save entry</Button></form></CardContent></Card><div className="space-y-3">{items.length ? items.map((item) => <Card key={item.id}><CardHeader><div className="flex items-center justify-between"><CardTitle>{item.title}</CardTitle><button onClick={() => remove(item.id)} aria-label="Delete diary entry" className="text-muted hover:text-black"><Trash2 className="h-4 w-4" /></button></div></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm text-muted">{item.content}</p></CardContent></Card>) : <Card><CardContent><p className="text-sm text-muted">Your diary is empty.</p></CardContent></Card>}</div></div>;
}
