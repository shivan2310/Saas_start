"use client";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { Expense } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function ExpensesPage() {
  const { user } = useAuth(); const [items, setItems] = useState<Expense[]>([]); const [description, setDescription] = useState(""); const [amount, setAmount] = useState(""); const [category, setCategory] = useState("General");
  useEffect(() => { if (user) personalService.getExpenses(user.uid).then(setItems); }, [user]);
  const submit = async (e: FormEvent) => { e.preventDefault(); if (!user || !description.trim() || !amount) return; const item = await personalService.addExpense(user.uid, description.trim(), Number(amount), category); setItems((v) => [item, ...v]); setDescription(""); setAmount(""); };
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold">Expenses</h2><p className="text-xs text-muted mt-1">Keep a simple record of where your money goes.</p></div><Card><CardHeader><CardTitle>Add an expense</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="grid gap-3 sm:grid-cols-4"><Input label="What was it?" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Coffee, groceries..." required /><Input label="Amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required /><Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} /><Button type="submit" className="self-end">Add expense</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Recent expenses</CardTitle></CardHeader><CardContent>{items.length ? items.map((item) => <div key={item.id} className="flex justify-between border-b border-border py-3 text-sm"><span>{item.description}<span className="ml-2 text-xs text-muted">{item.category}</span></span><span className="font-semibold">₹{item.amount.toFixed(2)}</span></div>) : <p className="text-sm text-muted">No expenses yet.</p>}</CardContent></Card></div>;
}
