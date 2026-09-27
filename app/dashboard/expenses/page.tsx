"use client";

import { FormEvent, useEffect, useMemo, useState, useRef, useCallback, memo } from "react";
import { Trash2, Plus, ChevronDown, ChevronLeft, ChevronRight, Search, Calendar, CalendarDays, Filter, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { expenseService } from "@/services/expenseService";
import { Expense } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, toLocalDateKey } from "@/lib/utils";
import { DonutChart } from "@/components/dashboard/DonutChart";

type TxnDateMode = "all" | "month" | "range";

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey: string): string {
  if (!monthKey) return "";
  const parts = monthKey.split("-");
  if (parts.length < 2) return monthKey;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const d = new Date(year, month, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatDateKey(dateKey: string): string {
  if (!dateKey) return "";
  const parts = dateKey.split("-");
  if (parts.length !== 3) return dateKey;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatTransactionDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

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


/**
 * Inclusive window of exactly `days` local calendar days ending today.
 * start = local midnight of (today - (days - 1)), end = now.
 */
function getPeriodWindow(days: number): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { start, end: new Date() };
}

/** Round up to a "nice" Y-axis maximum (1/2/2.5/5 × 10^n) slightly above `value`. */
function niceCeil(value: number): number {
  if (!(value > 0)) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const fraction = value / magnitude;
  const steps = [1, 2, 2.5, 5, 10];
  const nice = steps.find((s) => s >= fraction * (1 + 1e-9)) ?? 10;
  return nice * magnitude;
}

interface ChartPoint {
  date: string;
  value: number;
}

const LineChart = memo(function LineChart({ data, period }: { data: ChartPoint[]; period: Period }) {
  // Hooks must run unconditionally (before any early return) per the Rules of Hooks.
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Clear hover state when the dataset changes (e.g., switching period) so a
  // stale index can never point past the end of the new dataset.
  useEffect(() => {
    setHoveredIndex(null);
  }, [data]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.max(width, 1), height: Math.max(height, 280) });
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  if (data.length < 1) {
    return (
      <div ref={containerRef} className="relative w-full h-full min-h-[280px] min-w-0" role="img" aria-label="Spending trend chart" />
    );
  }

  const { width, height } = dimensions;

  if (width < 50) {
    return (
      <div ref={containerRef} className="relative w-full h-full min-h-[280px] min-w-0" role="img" aria-label="Spending trend chart" />
    );
  }

  // Y-axis: zero baseline, topped by a nice value slightly above the real max.
  const maxValue = niceCeil(Math.max(...data.map((d) => d.value), 1));
  const minValue = 0; // Expense data is never negative - force zero baseline

  const padding = { top: 16, right: 24, bottom: 50, left: 0 };
  const yAxisWidth = 50;
  const plotWidth = width - padding.left - padding.right - yAxisWidth;
  const plotHeight = height - padding.top - padding.bottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    return (
      <div ref={containerRef} className="relative w-full h-full min-h-[280px] min-w-0" role="img" aria-label="Spending trend chart" />
    );
  }

  const getTooltipAnchor = (x: number) => {
    if (x < padding.left + yAxisWidth + 30) return "start";
    if (x > width - padding.right - 30) return "end";
    return "middle";
  };

  // Y-axis: generate nice round numbers
  const yTickCount = 5;
  const yLabels = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const value = maxValue - (i / yTickCount) * (maxValue - minValue);
    const y = padding.top + (i / yTickCount) * plotHeight;
    let displayValue: string;
    if (value >= 100000) displayValue = `₹${(value / 100000).toFixed(1)}L`;
    else if (value >= 1000) displayValue = `₹${(value / 1000).toFixed(1)}K`;
    else displayValue = `₹${Math.round(value).toLocaleString()}`;
    return { value: displayValue, y };
  });

  // X-axis: proper tick generation per period
  const xTicks = generateXTicks(data, period, plotWidth, width);

  // Single source of truth for point positions: straight segments between the
  // actual aggregated values — no smoothing, interpolation, or synthetic data.
  const stepX = plotWidth / data.length;
  const scaleY = (value: number) =>
    padding.top + plotHeight - ((value - minValue) / (maxValue - minValue || 1)) * plotHeight;
  const pointCoords = data.map((d, i) => ({
    x: padding.left + yAxisWidth + (i + 0.5) * stepX,
    y: scaleY(d.value),
  }));

  let linePath = "";
  let areaPath = "";
  if (pointCoords.length > 0) {
    linePath = `M ${pointCoords[0].x} ${pointCoords[0].y}`;
    areaPath = `M ${pointCoords[0].x} ${padding.top + plotHeight} L ${pointCoords[0].x} ${pointCoords[0].y}`;
    for (let i = 1; i < pointCoords.length; i++) {
      linePath += ` L ${pointCoords[i].x} ${pointCoords[i].y}`;
      areaPath += ` L ${pointCoords[i].x} ${pointCoords[i].y}`;
    }
    areaPath += ` L ${pointCoords[pointCoords.length - 1].x} ${padding.top + plotHeight} Z`;
  }

  // Defensively clamp the hover index so a stale value can never index out of bounds.
  const activeIndex =
    hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < data.length ? hoveredIndex : null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Find closest point
    let closestIndex = 0;
    let minDist = Infinity;
    pointCoords.forEach((p, i) => {
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });
    
    if (minDist < 1600) { // ~40px threshold
      setHoveredIndex(closestIndex);
    } else {
      setHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[280px] min-w-0 overflow-hidden" role="img" aria-label="Spending trend chart">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full" 
        style={{ width: '100%', height: '100%', display: 'block', maxWidth: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--dash-accent)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--dash-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        <g fontSize="13" fill="var(--dash-text-muted)" fontFamily="inherit">
          {yLabels.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left + yAxisWidth}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="var(--dash-border-secondary)"
                strokeWidth="0.5"
                opacity={i === 0 ? 0.6 : 0.25}
                strokeDasharray={i === 0 ? "none" : "3 3"}
              />
              <text
                x={padding.left + yAxisWidth - 8}
                y={tick.y + 4.5}
                textAnchor="end"
                className="text-dash-text-secondary"
                style={{ fontSize: '13px', fontWeight: 400, fontFamily: 'inherit' }}
              >
                {tick.value}
              </text>
            </g>
          ))}
        </g>

        {/* Y-axis line */}
        <line
          x1={padding.left + yAxisWidth}
          y1={padding.top}
          x2={padding.left + yAxisWidth}
          y2={height - padding.bottom}
          stroke="var(--dash-border-secondary)"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Area fill under line */}
        <path
          d={areaPath}
          fill="url(#lineGradient)"
          opacity={0.8}
        />

        {/* Line */}
        <path
          d={linePath}
          stroke="var(--dash-accent)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        <g>
          {pointCoords.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={activeIndex === i ? 6 : 4}
                fill="var(--dash-accent)"
                stroke="var(--dash-card)"
                strokeWidth={activeIndex === i ? 2 : 3}
                opacity={data[i].value > 0 ? 1 : 0.3}
              />
            </g>
          ))}
        </g>

        {/* Hover tooltip line and highlight */}
        {activeIndex !== null && (
          <g>
            <line
              x1={pointCoords[activeIndex].x}
              y1={padding.top}
              x2={pointCoords[activeIndex].x}
              y2={height - padding.bottom}
              stroke="var(--dash-accent)"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <circle
              cx={pointCoords[activeIndex].x}
              cy={pointCoords[activeIndex].y}
              r={8}
              fill="none"
              stroke="var(--dash-accent)"
              strokeWidth="2"
            />
            <text
              x={pointCoords[activeIndex].x}
              y={padding.top + 16}
              textAnchor={getTooltipAnchor(pointCoords[activeIndex].x)}
              className="text-dash-text"
              style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'inherit' }}
            >
              {formatTooltipValue(data[activeIndex].value)}
            </text>
            <text
              x={pointCoords[activeIndex].x}
              y={height - padding.bottom + 36}
              textAnchor={getTooltipAnchor(pointCoords[activeIndex].x)}
              className="text-dash-text-secondary"
              style={{ fontSize: '11px', fontWeight: 400, fontFamily: 'inherit' }}
            >
              {formatTooltipDate(data[activeIndex].date, period)}
            </text>
          </g>
        )}

        {/* X-axis labels */}
        <g fill="var(--dash-text-muted)" textAnchor="middle" fontFamily="inherit">
          {xTicks.map((tick, i) => (
            <text
              key={i}
              x={padding.left + yAxisWidth + tick.x}
              y={height - padding.bottom + 20}
              className="text-dash-text-secondary"
              style={{ fontSize: '12px', fontWeight: 400, fontFamily: 'inherit' }}
            >
              {tick.label}
            </text>
          ))}
        </g>

        {/* X-axis line */}
        <line
          x1={padding.left + yAxisWidth}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--dash-border-secondary)"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </svg>
    </div>
  );
});

function generateXTicks(
  data: ChartPoint[],
  period: Period,
  plotWidth: number,
  fullWidth: number
): { x: number; label: string }[] {
  const count = data.length;
  if (count === 0) return [];

  const stepX = plotWidth / count;

  // Label density per period - responsive based on container width
  let maxLabels = count;
  const isNarrow = fullWidth < 600;
  const isMedium = fullWidth < 900;

  switch (period) {
    case "7d":
      maxLabels = 7;
      break;
    case "30d":
      maxLabels = isNarrow ? 4 : isMedium ? 5 : 7;
      break;
    case "90d":
      maxLabels = isNarrow ? 3 : isMedium ? 4 : 6;
      break;
    case "180d":
      maxLabels = isNarrow ? 4 : isMedium ? 5 : 6;
      break;
    case "1y":
      maxLabels = isNarrow ? 4 : isMedium ? 8 : 12;
      break;
  }

  maxLabels = Math.min(maxLabels, count);
  const labelInterval = Math.max(1, Math.ceil(count / maxLabels));

  // Evenly spaced ticks across the actual buckets, oldest → newest.
  return data.map((d, i) => ({
    x: (i + 0.5) * stepX,
    label: i % labelInterval === 0 || i === count - 1 ? formatXLabel(d.date, period) : "",
  }));
}

function formatXLabel(dateStr: string, period: Period): string {
  const date = new Date(dateStr + "T00:00:00");
  switch (period) {
    case "7d":
      return date.toLocaleDateString("en-GB", { weekday: "short" });
    case "30d":
      // Compact day-only labels keep 30 daily buckets readable; the tooltip
      // shows the full date.
      return String(date.getDate());
    case "90d":
    case "180d":
    case "1y":
      return date.toLocaleDateString("en-GB", { month: "short" });
    default:
      return date.toLocaleDateString("en-GB", { weekday: "short" });
  }
}

function formatTooltipValue(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString()}`;
}

function formatTooltipDate(dateStr: string, period: Period): string {
  const date = new Date(dateStr + "T00:00:00");
  switch (period) {
    case "7d":
      return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    case "30d":
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    case "90d":
    case "180d":
    case "1y":
      return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    default:
      return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
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
        <p className={cn("text-[11px] font-medium mt-2 flex items-center gap-1", trend.positive ? "text-dash-accent" : "text-red-500")}>
          {trend.value}
        </p>
      )}
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
    <tr className="border-b border-dash-border-secondary last:border-0 hover:bg-dash-hover/60 transition-colors">
      <td className="py-3 px-4 text-[12px] text-dash-text-muted whitespace-nowrap">{formatTransactionDate(item.createdAt)}</td>
      <td className="py-3 px-4 text-[13px] font-medium text-dash-text">{item.description}</td>
      <td className="py-3 px-4 text-[12px] text-dash-text-secondary">{item.category}</td>
      <td className="py-3 px-4 text-[12px] text-dash-text-muted capitalize">{item.paymentType || "—"}</td>
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
  const [paymentType, setPaymentType] = useState("Credit Card");
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [period, setPeriod] = useState<Period>("30d");

  // Transactions Filter States
  const [txnDateMode, setTxnDateMode] = useState<TxnDateMode>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthKey());
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortDesc, setSortDesc] = useState(true);

  // Pagination for transactions
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

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
      expenseService.getExpenses(user.uid).then((data) => {
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
      const item = await expenseService.addExpense(user.uid, description.trim(), numericAmount, finalCategory, paymentType);
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
    await expenseService.deleteExpense(id);
    setItems((v) => v.filter((item) => item.id !== id));
  };

  const periodDays = PERIOD_OPTIONS.find((p) => p.value === period)?.days ?? 30;
  // Stable per-period window: exactly `periodDays` local calendar days ending today.
  const periodStart = useMemo(() => getPeriodWindow(periodDays).start, [periodDays]);

  // Available months that have transactions + current month
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const currentKey = getCurrentMonthKey();
    monthSet.add(currentKey);
    if (selectedMonth) monthSet.add(selectedMonth);
    items.forEach((item) => {
      const key = toLocalDateKey(item.createdAt);
      if (key && key.length >= 7) {
        monthSet.add(key.slice(0, 7));
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [items, selectedMonth]);

  const goToPrevMonth = () => {
    const [y, m] = (selectedMonth || getCurrentMonthKey()).split("-").map(Number);
    const d = new Date(y, m - 1 - 1, 1);
    const prevKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(prevKey);
  };

  const goToNextMonth = () => {
    const [y, m] = (selectedMonth || getCurrentMonthKey()).split("-").map(Number);
    const d = new Date(y, m - 1 + 1, 1);
    const nextKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    setSelectedMonth(nextKey);
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(getCurrentMonthKey());
  };

  const applyRangePreset = (preset: "7d" | "30d" | "thisMonth" | "lastMonth" | "thisYear" | "clear") => {
    const now = new Date();
    const todayKey = toLocalDateKey(now);
    if (preset === "clear") {
      setStartDate("");
      setEndDate("");
      return;
    }
    if (preset === "7d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      setStartDate(toLocalDateKey(d));
      setEndDate(todayKey);
      return;
    }
    if (preset === "30d") {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      setStartDate(toLocalDateKey(d));
      setEndDate(todayKey);
      return;
    }
    if (preset === "thisMonth") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toLocalDateKey(d));
      setEndDate(todayKey);
      return;
    }
    if (preset === "lastMonth") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(toLocalDateKey(firstDay));
      setEndDate(toLocalDateKey(lastDay));
      return;
    }
    if (preset === "thisYear") {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      setStartDate(toLocalDateKey(firstDay));
      setEndDate(todayKey);
      return;
    }
  };

  const activePreset = useMemo(() => {
    if (txnDateMode !== "range" || !startDate || !endDate) return null;
    const now = new Date();
    const todayKey = toLocalDateKey(now);
    if (endDate !== todayKey) {
      const firstDayLM = toLocalDateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const lastDayLM = toLocalDateKey(new Date(now.getFullYear(), now.getMonth(), 0));
      if (startDate === firstDayLM && endDate === lastDayLM) return "lastMonth";
      return null;
    }
    const d7 = new Date(now);
    d7.setDate(d7.getDate() - 6);
    if (startDate === toLocalDateKey(d7)) return "7d";

    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 29);
    if (startDate === toLocalDateKey(d30)) return "30d";

    const thisMonthStart = toLocalDateKey(new Date(now.getFullYear(), now.getMonth(), 1));
    if (startDate === thisMonthStart) return "thisMonth";

    const thisYearStart = toLocalDateKey(new Date(now.getFullYear(), 0, 1));
    if (startDate === thisYearStart) return "thisYear";

    return null;
  }, [txnDateMode, startDate, endDate]);

  // Filtered transactions based on All / Month / Date Range
  const filteredItems = useMemo(() => {
    const effectiveStart = startDate && endDate && startDate > endDate ? endDate : startDate;
    const effectiveEnd = startDate && endDate && startDate > endDate ? startDate : endDate;

    return items
      .filter((item) => {
        const itemDateKey = toLocalDateKey(item.createdAt);
        if (txnDateMode === "month") {
          if (selectedMonth && !itemDateKey.startsWith(selectedMonth)) {
            return false;
          }
        } else if (txnDateMode === "range") {
          if (effectiveStart && itemDateKey < effectiveStart) return false;
          if (effectiveEnd && itemDateKey > effectiveEnd) return false;
        }
        return true;
      })
      .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
      .filter((item) =>
        searchQuery === "" ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.paymentType && item.paymentType.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) =>
        sortDesc
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [items, txnDateMode, selectedMonth, startDate, endDate, categoryFilter, searchQuery, sortDesc]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [txnDateMode, selectedMonth, startDate, endDate, categoryFilter, searchQuery]);

  const filteredTotal = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.amount, 0);
  }, [filteredItems]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  const paginatedItems = useMemo(() => {
    if (pageSize === -1) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const itemsInSelectedMonthCount = useMemo(() => {
    if (!selectedMonth) return 0;
    return items.filter((it) => toLocalDateKey(it.createdAt).startsWith(selectedMonth)).length;
  }, [items, selectedMonth]);

  const filterSummaryText = useMemo(() => {
    if (txnDateMode === "all") {
      return "All Time";
    }
    if (txnDateMode === "month") {
      return formatMonthLabel(selectedMonth);
    }
    if (txnDateMode === "range") {
      if (startDate && endDate) {
        if (startDate === endDate) return formatDateKey(startDate);
        return `${formatDateKey(startDate)} – ${formatDateKey(endDate)}`;
      }
      if (startDate) return `From ${formatDateKey(startDate)}`;
      if (endDate) return `Up to ${formatDateKey(endDate)}`;
      return "Custom Range (All)";
    }
    return "All Time";
  }, [txnDateMode, selectedMonth, startDate, endDate]);

  const periodItems = useMemo(() => {
    return items.filter((item) => new Date(item.createdAt).getTime() >= periodStart.getTime());
  }, [items, periodStart]);

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

  const CHART_COLORS = [
  "#8FAF9F", // sage green (Shopping)
  "#F0A878", // peach/orange (Food)
  "#A8D0E6", // muted blue
  "#D4A5D4", // muted lavender
  "#F4C47C", // muted gold
  "#9DD4B8", // muted mint
  "#E6A8A8", // muted coral
  "#B8C8E6", // muted periwinkle
];

  const donutData = sortedCategories.slice(0, 6).map(([label, value], i) => ({
    label,
    value,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const lineChartData = useMemo((): ChartPoint[] => {
    // Aggregate REAL transactions only — sum amounts per bucket, zero-fill
    // gaps, no interpolation or synthetic points. Dates are normalized to the
    // user's local timezone so buckets match the days expenses actually
    // happened on.
    const totalsByDay = new Map<string, number>();
    const totalsByMonth = new Map<string, number>();
    periodItems.forEach((item) => {
      const dayKey = toLocalDateKey(item.createdAt);
      totalsByDay.set(dayKey, (totalsByDay.get(dayKey) || 0) + item.amount);
      const monthKey = dayKey.slice(0, 7);
      totalsByMonth.set(monthKey, (totalsByMonth.get(monthKey) || 0) + item.amount);
    });

    if (period === "7d" || period === "30d") {
      // Daily buckets: one per local calendar day in the window, oldest → newest.
      const buckets: ChartPoint[] = [];
      for (let i = 0; i < periodDays; i++) {
        const dayDate = new Date(periodStart);
        dayDate.setDate(dayDate.getDate() + i);
        const key = toLocalDateKey(dayDate);
        buckets.push({ date: key, value: totalsByDay.get(key) || 0 });
      }
      return buckets;
    }

    // Monthly buckets for 3M/6M/1Y: span from the window-start month through
    // the current month inclusive, so every expense inside the period filter
    // lands in a bucket (prevents silently dropping the partial first month).
    const buckets: ChartPoint[] = [];
    const now = new Date();
    const cursor = new Date(periodStart.getFullYear(), periodStart.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    while (cursor <= lastMonth) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({ date: `${key}-01`, value: totalsByMonth.get(key) || 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return buckets;
  }, [periodItems, periodDays, period, periodStart]);

  const previousPeriodItems = useMemo(() => {
    const prevEnd = periodStart.getTime();
    const prevStartDate = new Date(periodStart);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    const prevStart = prevStartDate.getTime();
    return items.filter((item) => {
      const t = new Date(item.createdAt).getTime();
      return t >= prevStart && t < prevEnd;
    });
  }, [items, periodStart, periodDays]);

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
          <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
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
            <div>
              <label className="text-[11px] font-medium text-dash-text-secondary uppercase tracking-wider block mb-1.5">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full bg-dash-surface border border-dash-border rounded-md px-3 py-2.5 text-[13px] text-dash-text-secondary focus:border-dash-accent focus:outline-none cursor-pointer"
              >
                {["Credit Card", "Debit Card", "Cash", "UPI", "Net Banking", "Wallet", "Other"].map((pt) => (
                  <option key={pt} value={pt} className="bg-dash-card">{pt}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-dash-border">
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
          value={formatCurrencyPrecise(avgPerDay)}
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
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5 lg:grid-rows-[380px]">
        {/* Spending Overview */}
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 min-w-0 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
            <div>
              <h2 className="text-[15px] font-semibold text-dash-text">Spending overview</h2>
              <p className="text-[12px] text-dash-text-muted mt-0.5">Your spending over time</p>
            </div>
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>

          {periodItems.length > 0 ? (
            <div className="flex-1 min-h-0">
              <LineChart data={lineChartData} period={period} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-center">
              <p className="text-dash-text-muted mb-3">No data available for this period.</p>
              <Button variant="dash-secondary" size="dash-sm" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first expense
              </Button>
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 min-w-0 flex flex-col">
          <div className="shrink-0 mb-4">
            <h2 className="text-[15px] font-semibold text-dash-text">Spending by category</h2>
            <p className="text-[12px] text-dash-text-muted mt-0.5">Where your money goes</p>
          </div>

          {periodItems.length > 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-0">
              <DonutChart
                categories={sortedCategories
                  .filter(([_, amount]) => amount > 0)
                  .map(([name, amount], i) => ({
                    name,
                    amount,
                    color: CHART_COLORS[i % CHART_COLORS.length],
                  }))}
                size={180}
                strokeWidth={20}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-dash-text-muted text-sm">
              No categories yet.
            </div>
          )}
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-dash-card border border-dash-border rounded-xl overflow-hidden shadow-xs">
        {/* Main Header */}
        <div className="p-5 border-b border-dash-border space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-[17px] font-semibold text-dash-text tracking-tight">Recent transactions</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-dash-surface border border-dash-border text-dash-text-secondary">
                  {filteredItems.length}
                </span>
              </div>
              <p className="text-[12px] text-dash-text-muted mt-1 flex flex-wrap items-center gap-1.5">
                <span>Total: <strong className="text-dash-text font-semibold">{formatCurrencyPrecise(filteredTotal)}</strong></span>
                <span>•</span>
                <span className="text-dash-accent font-medium">{filterSummaryText}</span>
              </p>
            </div>

            {/* Time Filter Mode Tabs: All, By Month, Date Range */}
            <div className="flex items-center p-1 bg-dash-surface border border-dash-border rounded-lg self-start md:self-auto" role="group" aria-label="Transaction date filter mode">
              <button
                type="button"
                onClick={() => setTxnDateMode("all")}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium rounded-md transition-dash flex items-center gap-1.5",
                  txnDateMode === "all"
                    ? "bg-dash-card text-dash-text shadow-sm border border-dash-border/60"
                    : "text-dash-text-secondary hover:text-dash-text"
                )}
                aria-pressed={txnDateMode === "all"}
              >
                All Transactions
              </button>
              <button
                type="button"
                onClick={() => setTxnDateMode("month")}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium rounded-md transition-dash flex items-center gap-1.5",
                  txnDateMode === "month"
                    ? "bg-dash-card text-dash-text shadow-sm border border-dash-border/60"
                    : "text-dash-text-secondary hover:text-dash-text"
                )}
                aria-pressed={txnDateMode === "month"}
              >
                <Calendar className="h-3.5 w-3.5" />
                By Month
              </button>
              <button
                type="button"
                onClick={() => setTxnDateMode("range")}
                className={cn(
                  "px-3 py-1.5 text-[12px] font-medium rounded-md transition-dash flex items-center gap-1.5",
                  txnDateMode === "range"
                    ? "bg-dash-card text-dash-text shadow-sm border border-dash-border/60"
                    : "text-dash-text-secondary hover:text-dash-text"
                )}
                aria-pressed={txnDateMode === "range"}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Date Range
              </button>
            </div>
          </div>

          {/* Conditional Sub-Bar: By Month mode */}
          {txnDateMode === "month" && (
            <div className="pt-3 border-t border-dash-border-secondary flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-medium text-dash-text-secondary">Select Month:</span>
                
                {/* Previous Month */}
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="p-1.5 rounded-md bg-dash-surface border border-dash-border text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover transition-dash"
                  title="Previous month"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Dropdown of available months */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-dash-surface border border-dash-border rounded-md px-3 py-1.5 text-[13px] font-medium text-dash-text focus:border-dash-accent focus:outline-none cursor-pointer"
                  aria-label="Select month"
                >
                  {availableMonths.map((m) => {
                    const count = items.filter((it) => toLocalDateKey(it.createdAt).startsWith(m)).length;
                    return (
                      <option key={m} value={m} className="bg-dash-card text-dash-text">
                        {formatMonthLabel(m)} ({count})
                      </option>
                    );
                  })}
                </select>

                {/* Next Month */}
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-1.5 rounded-md bg-dash-surface border border-dash-border text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover transition-dash"
                  title="Next month"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Direct Month Input (HTML5) */}
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                  className="bg-dash-surface border border-dash-border rounded-md px-2.5 py-1.5 text-[12px] text-dash-text focus:border-dash-accent focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                  title="Choose specific month and year"
                  aria-label="Month picker"
                />

                {/* Quick button to return to Current Month */}
                {selectedMonth !== getCurrentMonthKey() && (
                  <button
                    type="button"
                    onClick={goToCurrentMonth}
                    className="text-[11px] font-medium px-2.5 py-1 rounded bg-dash-surface hover:bg-dash-hover text-dash-accent border border-dash-border transition-dash"
                  >
                    Current Month
                  </button>
                )}
              </div>

              <div className="text-[12px] text-dash-text-muted">
                {itemsInSelectedMonthCount} expense{itemsInSelectedMonthCount !== 1 ? "s" : ""} in {formatMonthLabel(selectedMonth)}
              </div>
            </div>
          )}

          {/* Conditional Sub-Bar: Custom Date Range mode */}
          {txnDateMode === "range" && (
            <div className="pt-3 border-t border-dash-border-secondary space-y-2.5 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-medium text-dash-text-secondary whitespace-nowrap">From:</label>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-dash-surface border border-dash-border rounded-md px-2.5 py-1.5 text-[12px] text-dash-text focus:border-dash-accent focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    aria-label="Start date"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-medium text-dash-text-secondary whitespace-nowrap">To:</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-dash-surface border border-dash-border rounded-md px-2.5 py-1.5 text-[12px] text-dash-text focus:border-dash-accent focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
                    aria-label="End date"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={() => { setStartDate(""); setEndDate(""); }}
                    className="text-[11px] font-medium px-2 py-1 rounded text-dash-text-muted hover:text-dash-text hover:bg-dash-hover transition-dash flex items-center gap-1"
                    title="Clear date range"
                  >
                    <X className="h-3.5 w-3.5" /> Clear range
                  </button>
                )}
              </div>

              {/* Quick Presets for Date Range */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-dash-text-muted mr-1">Presets:</span>
                {[
                  { id: "7d", label: "Last 7 Days" },
                  { id: "30d", label: "Last 30 Days" },
                  { id: "thisMonth", label: "This Month" },
                  { id: "lastMonth", label: "Last Month" },
                  { id: "thisYear", label: "This Year" },
                ].map((p) => {
                  const isPresetActive = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyRangePreset(p.id as any)}
                      className={cn(
                        "px-2.5 py-1 text-[11px] font-medium rounded-md border transition-dash",
                        isPresetActive
                          ? "bg-dash-accent/15 text-dash-accent border-dash-accent/40 font-semibold"
                          : "bg-dash-surface border-dash-border text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search, Category Filter, and Sorting Controls */}
          <div className="pt-3 border-t border-dash-border-secondary flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 sm:max-w-xs min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted" />
                <input
                  type="text"
                  placeholder="Search description, category, payment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dash-surface border border-dash-border rounded-md pl-9 pr-3 py-1.5 text-[13px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-accent focus:outline-none"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-dash-surface border border-dash-border rounded-md px-3 py-1.5 text-[13px] text-dash-text-secondary focus:border-dash-accent focus:outline-none cursor-pointer"
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSortDesc(!sortDesc)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-md text-[12px] font-medium text-dash-text-secondary hover:text-dash-text transition-dash"
                aria-label={sortDesc ? "Sort oldest first" : "Sort newest first"}
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", !sortDesc && "rotate-180")} />
                <span>{sortDesc ? "Newest first" : "Oldest first"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
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
                      <div className="space-y-3">
                        <p className="text-[14px] text-dash-text-muted">
                          {txnDateMode === "month"
                            ? `No transactions recorded for ${formatMonthLabel(selectedMonth)}.`
                            : txnDateMode === "range" && (startDate || endDate)
                            ? `No transactions found between ${formatDateKey(startDate) || "beginning"} and ${formatDateKey(endDate) || "today"}.`
                            : "No transactions match your search or filter."}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setTxnDateMode("all");
                              setSearchQuery("");
                              setCategoryFilter("all");
                              setStartDate("");
                              setEndDate("");
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-md bg-dash-surface border border-dash-border text-dash-accent hover:bg-dash-hover transition-dash"
                          >
                            View all transactions
                          </button>
                          <Button variant="dash-secondary" size="dash-sm" onClick={() => setShowAdd(true)}>
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add expense
                          </Button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <TransactionRow key={item.id} item={item} onDelete={remove} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredItems.length > 0 && (
          <div className="p-4 border-t border-dash-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[12px] text-dash-text-muted bg-dash-surface/30">
            <div className="flex items-center gap-3">
              <span>
                Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} transactions
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-dash-surface border border-dash-border rounded px-2 py-1 text-[11px] text-dash-text-secondary focus:outline-none cursor-pointer"
                aria-label="Items per page"
              >
                <option value={15}>15 per page</option>
                <option value={30}>30 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded bg-dash-surface border border-dash-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dash-hover text-dash-text transition-dash font-medium"
                >
                  Previous
                </button>
                <span className="px-2 py-1 text-dash-text font-medium text-[11px]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded bg-dash-surface border border-dash-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dash-hover text-dash-text transition-dash font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
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
          <>
            {paginatedItems.map((item) => (
              <div key={item.id} className="bg-dash-card border border-dash-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-dash-text truncate">{item.description}</p>
                    <p className="text-[11px] text-dash-text-muted mt-0.5">{item.category} · {formatTransactionDate(item.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[15px] font-semibold text-dash-text text-right whitespace-nowrap">{formatCurrencyPrecise(item.amount)}</span>
                    <button onClick={() => remove(item.id)} className="text-dash-text-muted hover:text-dash-text p-1" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile pagination if multiple pages */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-3 bg-dash-card border border-dash-border rounded-xl text-[12px]">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded bg-dash-surface border border-dash-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dash-hover text-dash-text transition-dash font-medium"
                >
                  Previous
                </button>
                <span className="text-dash-text font-medium text-[12px]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded bg-dash-surface border border-dash-border disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dash-hover text-dash-text transition-dash font-medium"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}