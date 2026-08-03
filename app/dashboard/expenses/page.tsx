"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { Expense } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";

export default function ExpensesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    if (user) personalService.getExpenses(user.uid).then(setItems);
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !description.trim() || !amount) return;
    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (!finalCategory) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0 || numericAmount > 100000000) return;
    const item = await personalService.addExpense(user.uid, description.trim(), numericAmount, finalCategory);
    setItems((v) => [item, ...v]);
    setDescription("");
    setAmount("");
    setCustomCategory("");
  };

  const remove = async (id: string) => {
    await personalService.remove("expenses", id);
    setItems((v) => v.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Expenses</h2>
        <p className="text-xs text-muted mt-1">
          Keep a simple record of where your money goes.
        </p>
      </div>

      {/* Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add an expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label="What was it?"
              value={description}
              maxLength={200}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Coffee, groceries..."
              required
            />
            <Input
              label="Amount"
              type="number"
              min="0"
              max="100000000"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <div className="w-full flex flex-col gap-1.5">
              <label
                htmlFor="expense-category"
                className="text-xs font-medium text-black uppercase tracking-wider"
              >
                Category
              </label>
              <select
                id="expense-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-10 w-full rounded border border-border bg-white px-3 py-2 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option>Food</option>
                <option>Transport</option>
                <option>Shopping</option>
                <option>Bills</option>
                <option>Health</option>
                <option>Entertainment</option>
                <option>Education</option>
                <option>Travel</option>
                <option>Home</option>
                <option>Salary</option>
                <option>Custom</option>
              </select>
            </div>
            {category === "Custom" && (
              <Input
                label="Custom category"
                maxLength={100}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Pets"
                required
              />
            )}
            <Button type="submit" className="self-end">
              Add expense
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Side-by-Side Section: Bar Chart & Recent Expenses */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Graphical Expense Analytics Chart */}
        <ExpenseChart expenses={items} interactive={false} />

        {/* Recent Expenses List */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Recent expenses</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-border py-3 text-sm last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-medium text-black truncate">{item.description}</span>
                    <span className="rounded bg-surface px-2 py-0.5 text-xs text-muted shrink-0">
                      {item.category}
                    </span>
                  </div>
                  <span className="flex items-center gap-3 font-semibold text-black shrink-0">
                    ₹{item.amount.toFixed(2)}
                    <button
                      onClick={() => remove(item.id)}
                      aria-label="Delete expense"
                      className="text-muted hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">No expenses yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
