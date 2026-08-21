"use client";

import { FormEvent, useEffect, useMemo, useState, useCallback } from "react";
import { Trash2, Plus, ChevronDown, Search, Calendar, Filter, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { Expense } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
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

type Period = "7d" | "30d" | "90d" | "180d" | "1y";

const PERIOD_OPTIONS: { value: Period; label: string; days: number }[] = [
  { value: "7d", label: "7D", days: 7 },
  { value: "30d", label: "30D", days: 30 },
  { value: "90d", label: "3M", days: 90 },
  { value: "180d", label: "6M", days: 180 },
  { value: "1y", label: "1Y", days: 365 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getDateNDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function LineChart({ data }: { data: { label: string; value: number; date: string }[] }) {
  if (data.length < 2) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value));
  const padding = 24;
  const width = 100 - padding * 2;
  const height = 100 - padding * 2;

  const points = data
    .map((d, i) => {
      const x = padding + (i / (data.length - 1)) * width;
      const y = 100 - padding - ((d.value - minValue) / (maxValue - minValue || 1)) * height;
      return `${x}% ${y}%`;
    })
    .join(" ");

  const areaPoints = [
    `${padding}% ${100 - padding}%`,
    ...points.split(" "),
    `${100 - padding}% ${100 - padding}%`,
  ].join(" ");

  return (
    <div className="relative h-64 w-full" role="img" aria-label="Spending trend chart">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spendingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8FAFA5" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#8FAFA5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g stroke="#292C2D" strokeWidth="0.4" opacity="0.4">
          {[0, 20, 40, 60, 80, 100].map((y) => (
            <line key={y} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} />
          ))}
        </g>
        <polygon points={areaPoints} fill="url(#spendingGradient)" />
        <polyline
          points={points}
          fill="none"
          stroke="#8FAFA5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g>
          {data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * width;
            const y = 100 - padding - ((d.value - minValue) / (maxValue - minValue || 1)) * height;
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="3"
                fill="#8FAFA5"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              />
            );
          })}
        </g>
      </svg>
      <div className="flex justify-between -mx-2 mt-3 text-[10px] text-dash-text-muted">
        {data.map((d, i) => (
          <span key={i} className="px-2 text-center">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({
  data,
  total,
}: {
  data: { label: string; value: number; color: string }[];
  total: number;
}) {
  if (data.length === 0) return null;

  const circumference = 2 * Math.PI * 45;
  let currentAngle = -90;

  return (
    <div className="relative w-48 h-48 flex-shrink-0" role="img" aria-label="Category distribution">
      <svg viewBox="0 0 120 120" className="w-48 h-48 -rotate-90">
        {data.map((segment, i) => {
          const percentage = total > 0 ? segment.value / total : 0;
          const strokeDasharray = `${percentage * circumference} ${circumference}`;
          const strokeDashoffset = circumference * (currentAngle / 360 + percentage / 2);
          currentAngle += percentage * 360;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={segment.color}
              strokeWidth="16"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[22px] font-semibold text-dash-text">{formatCurrency(total)}</span>
        <span className="text-[11px] text-dash-text-muted uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}

function Tooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; color: string; name: string }[]; label?: string }) {
  if (!active || !payload || !label) return null;
  const item = payload[0];
  return (
    <div className="bg-dash-elevated border border-dash-border rounded-lg p-3 shadow-lg text-center">
      <p className="text-[12px] font-medium text-dash-text">{label}</p>
      <p className="text-[16px] font-semibold text-dash-text mt-0.5">{formatCurrency(item.value)}</p>
    </div>
  );
}

function PeriodSelector({ selected, onChange }: { selected: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex items-center gap-1 bg-dash-surface rounded-md p-1" role="group" aria-label="Time period">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 text-[12px] font-medium rounded-sm transition-dash",
            selected === opt.value
              ? "bg-dash-card text-dash-text shadow-sm"
              : "text-dash-text-secondary hover:text-dash-text"
          )}
          aria-pressed={selected === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string;
  sublabel?: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="bg-dash-card border border-dash-border rounded-xl p-5">
      <p className="text-[11px] font-medium text-dash-text-muted uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-[24px] font-semibold text-dash-text leading-tight">{value}</p>
      {sublabel && <p className="text-[11px] text-dash-text-muted mt-1">{sublabel}</p>}
      {trend && (
        <p className={cn("text-[11px] font-medium mt-2 flex items-center gap-1", trend.positive ? "text-green-400" : "text-red-400")}>
          {trend.value}
        </p>
      )}
    </div>
  );
}

function CategoryLegendItem({
  color,
  label,
  amount,
  percentage,
}: {
  color: string;
  label: string;
  amount: string;
  percentage: number;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[13px] text-dash-text-secondary truncate">{label}</span>
      <span className="text-[13px] font-medium text-dash-text ml-auto">{amount}</span>
      <span className="text-[11px] text-dash-text-muted w-14 text-right">{percentage.toFixed(0)}%</span>
    </div>
  );
}

function TransactionRow({
  item,
  onDelete,
}: {
  item: Expense;
  onDelete: (id: string) => void;
}) {
  return (
    <tr className="border-b border-dash-border/50 last:border-0 hover:bg-dash-hover/50 transition-colors">
      <td className="py-3 px-4 text-[12px] text-dash-text-muted whitespace-nowrap">{formatDateShort(item.createdAt)}</td>
      <td className="py-3 px-4 text-[13px] font-medium text-dash-text">{item.description}</td>
      <td className="py-3 px-4 text-[12px] text-dash-text-secondary">{item.category}</td>
      <td className="py-3 px-4 text-[12px] text-dash-text-muted">—</td>
      <td className="py-3 px-4 text-[13px] font-medium text-dash-text text-right">{formatCurrencyPrecise(item.amount)}</td>
      <td className="py-3 px-4 text-right">
        <button
          onClick={() => onDelete(item.id)}
          className="text-dash-text-muted hover:text-dash-text opacity-60 hover:opacity-100 transition-opacity p-1"
          aria-label="Delete expense"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function TransactionSkeleton() {
  return (
    <tr>
      <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
      <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
      <td className="py-3 px-4"></td>
    </tr>
  );
}

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
  const [period, setPeriod] = useState<Period>("30d");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortDesc, setSortDesc] = useState(true);

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
      personalService.getExpenses(user.uid).then((data) => {
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

  const periodDays = PERIOD_OPTIONS.find((p) => p.value === period)?.days ?? 30;
  const cutoffDate = getDateNDaysAgo(periodDays);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.createdAt >= cutoffDate)
      .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
      .filter((item) =>
        searchQuery === "" ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => (sortDesc ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
  }, [items, cutoffDate, categoryFilter, searchQuery, sortDesc]);

  const periodItems = useMemo(() => {
    return items.filter((item) => item.createdAt >= cutoffDate);
  }, [items, cutoffDate]);

  const total = periodItems.reduce((sum, item) => sum + item.amount, 0);
  const avgPerDay = periodItems.length > 0 ? total / periodDays : 0;
  const transactionCount = periodItems.length;

  const categoryTotals = periodItems.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + item.amount;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0];

  const CHART_COLORS = ["#8FAFA5", "#7DB8A8", "#6DB09E", "#5DA894", "#4D9F8A", "#3D9780"];

  const donutData = sortedCategories.slice(0, 6).map(([label, value], i) => ({
    label,
    value,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const lineChartData = useMemo(() => {
    const days = Array.from({ length: periodDays > 30 ? 12 : periodDays }, (_, i) => {
      const step = periodDays > 30 ? Math.floor(periodDays / 12) : 1;
      const d = new Date();
      d.setDate(d.getDate() - (periodDays - 1 - i * step));
      return d.toISOString().split("T")[0];
    });
    return days.map((day) => ({
      label: periodDays > 30 ? new Date(day).toLocaleDateString("en-GB", { month: "short", day: "numeric" }) : new Date(day).toLocaleDateString("en-GB", { weekday: "short" }),
      value: periodItems.filter((e) => e.createdAt.startsWith(day)).reduce((sum, e) => sum + e.amount, 0),
      date: day,
    }));
  }, [periodItems, periodDays]);

  const previousPeriodItems = useMemo(() => {
    const prevStart = new Date(cutoffDate);
    prevStart.setDate(prevStart.getDate() - periodDays);
    const prevStartStr = prevStart.toISOString().split("T")[0];
    return items.filter((item) => item.createdAt >= prevStartStr && item.createdAt < cutoffDate);
  }, [items, cutoffDate, periodDays]);

  const prevTotal = previousPeriodItems.reduce((sum, item) => sum + item.amount, 0);
  const totalTrend = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-dash-text">Expenses</h1>
          <p className="text-[14px] text-dash-text-secondary mt-0.5">Track and understand where your money goes.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="shrink-0 h-10 px-4">
          <Plus className="h-4 w-4 mr-2" />
          Add expense
        </Button>
      </div>

      {/* Add Expense Form */}
      {showAdd && (
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-4" role="dialog" aria-label="Add expense">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-semibold text-dash-text">Add expense</h3>
            <button onClick={() => setShowAdd(false)} className="text-dash-text-muted hover:text-dash-text p-1" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Description"
              placeholder="What was it?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              autoFocus
              required
            />
            <Input
              label="Amount (₹)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <div className="sm:col-span-3">
              <label className="text-[11px] font-medium text-dash-text-secondary uppercase tracking-wider block mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (e.target.value !== "Custom") setCustomCategory("");
                }}
                className="w-full bg-dash-surface border border-dash-border rounded-md px-3 py-2.5 text-[13px] text-dash-text-secondary focus:border-dash-accent focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-dash-card">
                    {c}
                  </option>
                ))}
                <option className="bg-dash-card" value="Custom">
                  Custom
                </option>
              </select>
              {category === "Custom" && (
                <Input
                  label="Custom category"
                  placeholder="Enter category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-3"
                  required
                />
              )}
            </div>
            <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-dash-border">
              <Button type="button" variant="dash-ghost" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="dash-primary" isLoading={isSubmitting}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total spent"
          value={formatCurrency(total)}
          trend={{ value: `${totalTrend >= 0 ? "+" : ""}${totalTrend.toFixed(1)}% vs last period`, positive: totalTrend >= 0 }}
        />
        <MetricCard
          label="Average / day"
          value={formatCurrency(avgPerDay)}
        />
        <MetricCard
          label="Transactions"
          value={transactionCount.toString()}
        />
        <MetricCard
          label="Top category"
          value={topCategory ? topCategory[0] : "—"}
          sublabel={topCategory ? formatCurrency(topCategory[1]) : undefined}
        />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* Spending Overview */}
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-dash-text">Spending overview</h2>
              <p className="text-[12px] text-dash-text-muted mt-0.5">Your spending over time</p>
            </div>
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>

          {periodItems.length > 0 ? (
            <div className="group">
              <LineChart data={lineChartData} />
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-dash-text-muted mb-3">No spending data for this period.</p>
              <Button variant="dash-secondary" size="dash-sm" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first expense
              </Button>
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-5">
          <div>
            <h2 className="text-[15px] font-semibold text-dash-text">Spending by category</h2>
            <p className="text-[12px] text-dash-text-muted mt-0.5">Where your money goes</p>
          </div>

          {periodItems.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <DonutChart data={donutData} total={total} />
              <div className="w-full space-y-2">
                {donutData.map((segment, i) => (
                  <CategoryLegendItem
                    key={segment.label}
                    color={segment.color}
                    label={segment.label}
                    amount={formatCurrency(segment.value)}
                    percentage={total > 0 ? (segment.value / total) * 100 : 0}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-dash-text-muted">
              No categories yet.
            </div>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-dash-card border border-dash-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-dash-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-dash-text">Recent transactions</h2>
            <p className="text-[12px] text-dash-text-muted mt-0.5">{filteredItems.length} transaction{filteredItems.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dash-surface border border-dash-border rounded-md pl-9 pr-3 py-2 text-[13px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-accent focus:outline-none w-[200px] sm:w-[280px]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-dash-surface border border-dash-border rounded-md px-3 py-2 text-[13px] text-dash-text-secondary focus:border-dash-accent focus:outline-none cursor-pointer"
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDesc(!sortDesc)}
              className="flex items-center gap-1.5 px-3 py-2 bg-dash-surface border border-dash-border rounded-md text-[12px] text-dash-text-secondary hover:text-dash-text transition-dash"
              aria-label={sortDesc ? "Sort ascending" : "Sort descending"}
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", sortDesc && "rotate-180")} />
              <span className="hidden sm:inline">Date</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="bg-dash-surface/50 border-b border-dash-border">
                <th className="py-3 px-4 text-left text-[11px] font-medium text-dash-text-muted uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-left text-[11px] font-medium text-dash-text-muted uppercase tracking-wider">Description</th>
                <th className="py-3 px-4 text-left text-[11px] font-medium text-dash-text-muted uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-[11px] font-medium text-dash-text-muted uppercase tracking-wider">Payment</th>
                <th className="py-3 px-4 text-right text-[11px] font-medium text-dash-text-muted uppercase tracking-wider">Amount</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                  <TransactionSkeleton />
                </>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-dash-text-muted">
                    {items.length === 0 ? (
                      <>
                        <p className="mb-2">No expenses yet.</p>
                        <Button variant="dash-secondary" size="dash-sm" onClick={() => setShowAdd(true)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add your first expense
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">No transactions match your filters.</p>
                        <button onClick={() => { setSearchQuery(""); setCategoryFilter("all"); }} className="text-dash-accent hover:underline text-sm">
                          Clear filters
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <TransactionRow key={item.id} item={item} onDelete={remove} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Transaction Cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          <>
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </>
        ) : filteredItems.length === 0 ? null : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-dash-card border border-dash-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-dash-text truncate">{item.description}</p>
                  <p className="text-[11px] text-dash-text-muted mt-0.5">{item.category} · {formatDateShort(item.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[15px] font-semibold text-dash-text text-right whitespace-nowrap">{formatCurrencyPrecise(item.amount)}</span>
                  <button onClick={() => remove(item.id)} className="text-dash-text-muted hover:text-dash-text p-1" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}