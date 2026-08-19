"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Trash2, TrendingUp, Tag, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { Expense } from "@/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Home",
  "Salary",
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [customCategory, setCustomCategory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, string>();
    [...DEFAULT_CATEGORIES, ...items.map((item) => item.category)].forEach((name) => {
      const trimmedName = name.trim();
      if (trimmedName) uniqueCategories.set(trimmedName.toLocaleLowerCase(), trimmedName);
    });
    return [...uniqueCategories.values()];
  }, [items]);

  useEffect(() => {
    if (user) {
      personalService.getExpenses(user.uid).then(data => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !description.trim() || !amount) return;
    const finalCategory = category === "Custom" ? customCategory.trim() : category;
    if (!finalCategory) return;
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) return;
    
    setIsSubmitting(true);
    try {
      const item = await personalService.addExpense(user.uid, description.trim(), numericAmount, finalCategory);
      setItems((v) => [item, ...v]);
      setDescription("");
      setAmount("");
      setCustomCategory("");
      setCategory(finalCategory);
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    await personalService.remove("expenses", id);
    setItems((v) => v.filter((item) => item.id !== id));
  };

  // Stats calculation
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const avgExpense = items.length > 0 ? total / items.length : 0;
  
  const categoryTotals = items.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + item.amount;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;
  const topCategory = sortedCategories[0];
  const displayCategories = sortedCategories.slice(0, 5);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-end justify-between">
        <h2 className="text-[24px] font-semibold tracking-tight text-dash-text">Expenses</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Stats & Add */}
        <div className="md:col-span-1 space-y-6">
          <div className="space-y-6">
            <div>
              <p className="text-[13px] text-dash-text-muted mb-1 uppercase tracking-wider font-medium">Total spent</p>
              <p className="text-[32px] font-semibold text-dash-text leading-none">₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            
            <div className="flex justify-between items-end border-b border-dash-border pb-4">
              <div>
                <p className="text-[12px] text-dash-text-muted mb-1 uppercase tracking-wider font-medium">Average expense</p>
                <p className="text-[16px] font-medium text-dash-text">₹{avgExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-dash-text-muted mb-1 uppercase tracking-wider font-medium">Highest category</p>
                <p className="text-[16px] font-medium text-dash-text">{topCategory ? topCategory[0] : "-"}</p>
              </div>
            </div>
          </div>

          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-[14px] font-medium text-dash-text-secondary hover:text-dash-text transition-colors"
            >
              <Plus className="h-4 w-4" /> Add expense
            </button>
          ) : (
            <form onSubmit={submit} className="bg-dash-card border border-dash-border rounded-lg p-4 space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="What was it?"
                  value={description}
                  maxLength={100}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-transparent border-b border-dash-border text-[14px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-text focus:outline-none py-1"
                  autoFocus
                  required
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Amount (₹)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-b border-dash-border text-[14px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-text focus:outline-none py-1"
                  required
                />
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (e.target.value !== "Custom") setCustomCategory("");
                  }}
                  className="w-full bg-transparent border-b border-dash-border text-[13px] text-dash-text-secondary focus:border-dash-text focus:outline-none py-1 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-dash-card">{c}</option>
                  ))}
                  <option className="bg-dash-card">Custom</option>
                </select>
                {category === "Custom" && (
                  <input
                    type="text"
                    placeholder="Custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full bg-transparent border-b border-dash-border text-[14px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-text focus:outline-none py-1"
                    required
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="dash-ghost" size="dash-sm" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="dash-primary" size="dash-sm" isLoading={isSubmitting}>
                  Save
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Chart & List */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Minimal Bar Chart */}
          {items.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[14px] font-medium text-dash-text-muted border-b border-dash-border pb-2">Category Breakdown</h3>
              <div className="h-40 flex items-end justify-between gap-2">
                {displayCategories.map(([cat, amt]) => {
                  const heightPercent = maxCategoryAmount > 0 ? Math.max((amt / maxCategoryAmount) * 100, 5) : 5;
                  return (
                    <div key={cat} className="group relative flex flex-col items-center flex-1 h-full justify-end">
                      <span className="absolute -top-6 text-[10px] font-medium text-dash-text opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{amt >= 1000 ? `${(amt / 1000).toFixed(1)}k` : amt.toFixed(0)}
                      </span>
                      <div className="w-full max-w-[40px] bg-dash-border rounded-t hover:bg-dash-text transition-colors" style={{ height: `${heightPercent}%` }} />
                      <span className="mt-2 text-[11px] text-dash-text-muted truncate w-full text-center group-hover:text-dash-text transition-colors">{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent List */}
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-dash-text-muted border-b border-dash-border pb-2">Recent Expenses</h3>
            
            {loading ? (
              <div className="text-[13px] text-dash-text-muted">Loading expenses...</div>
            ) : items.length === 0 ? (
              <div className="text-[13px] text-dash-text-muted">No expenses yet. Add your first expense to start tracking your spending.</div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="group flex items-center justify-between py-2.5 px-2 -mx-2 hover:bg-dash-hover rounded-md transition-colors">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-dash-text">{item.description}</span>
                      <span className="text-[11px] text-dash-text-muted">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[15px] font-medium text-dash-text">₹{item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      <button 
                        onClick={() => remove(item.id)}
                        className="text-dash-text-muted hover:text-dash-text opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
