"use client";

import { FormEvent, useEffect, useMemo, useState, useRef, useCallback } from "react";
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

function LineChart({ data, period }: { data: { label: string; value: number; date: string }[]; period: Period }) {
  if (data.length < 1) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 280 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions((prev) => ({ ...prev, width: Math.max(width, 1) }));
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;

  if (width < 50) {
    return (
      <div ref={containerRef} className="relative w-full min-w-0" style={{ height: `${height}px` }} role="img" aria-label="Spending trend chart" />
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const allZero = data.every(d => d.value === 0);
  const minValue = 0; // Expense data is never negative - force zero baseline

  const padding = { top: 16, right: 16, bottom: 50, left: 0 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    return (
      <div ref={containerRef} className="relative w-full min-w-0" style={{ height: `${height}px` }} role="img" aria-label="Spending trend chart" />
    );
  }

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
  const xTicks = generateXTicks(data, period, padding, plotWidth);
  const yAxisWidth = 50;

  // Generate smooth line path
  const linePath = generateLinePath(data, padding, yAxisWidth, plotWidth, plotHeight, maxValue, minValue);
  const pointCoords = generatePointCoords(data, padding, yAxisWidth, plotWidth, plotHeight, maxValue, minValue);

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
    <div ref={containerRef} className="relative w-full min-w-0" style={{ height: `${height}px` }} role="img" aria-label="Spending trend chart">
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full" 
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5BA37D" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#5BA37D" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines and labels */}
        <g fontSize="13" fill="#9AA0A0" fontFamily="inherit">
          {yLabels.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left + yAxisWidth}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#2D3132"
                strokeWidth="0.5"
                opacity={i === 0 ? 0.5 : 0.15}
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
          stroke="#2D3132"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* Area fill under line */}
        <path
          d={linePath.area}
          fill="url(#lineGradient)"
          opacity={0.8}
        />

        {/* Line */}
        <path
          d={linePath.line}
          stroke="#5BA37D"
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
                r={hoveredIndex === i ? 6 : 4}
                fill="#5BA37D"
                stroke="#1A1A1A"
                strokeWidth={hoveredIndex === i ? 2 : 3}
                opacity={data[i].value > 0 ? 1 : 0.3}
              />
            </g>
          ))}
        </g>

        {/* Hover tooltip line and highlight */}
        {hoveredIndex !== null && (
          <g>
            <line
              x1={pointCoords[hoveredIndex].x}
              y1={padding.top}
              x2={pointCoords[hoveredIndex].x}
              y2={height - padding.bottom}
              stroke="#5BA37D"
              strokeWidth="1"
              strokeDasharray="4 4"
              opacity="0.5"
            />
            <circle
              cx={pointCoords[hoveredIndex].x}
              cy={pointCoords[hoveredIndex].y}
              r={8}
              fill="none"
              stroke="#5BA37D"
              strokeWidth="2"
            />
            <text
              x={pointCoords[hoveredIndex].x}
              y={padding.top + 16}
              textAnchor="middle"
              className="text-dash-text"
              style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'inherit' }}
            >
              {formatTooltipValue(data[hoveredIndex].value)}
            </text>
            <text
              x={pointCoords[hoveredIndex].x}
              y={height - padding.bottom + 36}
              textAnchor="middle"
              className="text-dash-text-secondary"
              style={{ fontSize: '11px', fontWeight: 400, fontFamily: 'inherit' }}
            >
              {formatTooltipDate(data[hoveredIndex].date, period)}
            </text>
          </g>
        )}

        {/* X-axis labels */}
        <g fill="#9AA0A0" textAnchor="middle" fontFamily="inherit">
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
          stroke="#2D3132"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </div>
  );
}

function generateLinePath(
  data: { label: string; value: number; date: string }[],
  padding: { left: number; right: number; top: number; bottom: number },
  yAxisWidth: number,
  plotWidth: number,
  plotHeight: number,
  maxValue: number,
  minValue: number
): { line: string; area: string } {
  const count = data.length;
  if (count === 0) return { line: "", area: "" };

  const stepX = plotWidth / count;
  const scaleY = (value: number) => padding.top + plotHeight - ((value - minValue) / (maxValue - minValue || 1)) * plotHeight;

  const points = data.map((d, i) => ({
    x: padding.left + yAxisWidth + (i + 0.5) * stepX,
    y: scaleY(d.value),
  }));

  // Generate linear (straight) line - no overshoot, no negative values
  let linePath = `M ${points[0].x} ${points[0].y}`;
  let areaPath = `M ${points[0].x} ${padding.top + plotHeight} L ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < count; i++) {
    linePath += ` L ${points[i].x} ${points[i].y}`;
    areaPath += ` L ${points[i].x} ${points[i].y}`;
  }

  areaPath += ` L ${points[count - 1].x} ${padding.top + plotHeight} Z`;

  return { line: linePath, area: areaPath };
}

function generatePointCoords(
  data: { label: string; value: number; date: string }[],
  padding: { left: number; right: number; top: number; bottom: number },
  yAxisWidth: number,
  plotWidth: number,
  plotHeight: number,
  maxValue: number,
  minValue: number
): { x: number; y: number }[] {
  const count = data.length;
  if (count === 0) return [];

  const stepX = plotWidth / count;
  const scaleY = (value: number) => padding.top + plotHeight - ((value - minValue) / (maxValue - minValue || 1)) * plotHeight;

  return data.map((d, i) => ({
    x: padding.left + yAxisWidth + (i + 0.5) * stepX,
    y: scaleY(d.value),
  }));
}

function generateXTicks(
  data: { label: string; value: number; date: string }[],
  period: Period,
  padding: { left: number; right: number; top: number; bottom: number },
  plotWidth: number
): { x: number; label: string; width: number }[] {
  const count = data.length;
  if (count === 0) return [];

  const stepX = plotWidth / count;

  // Label density per period
  let labelInterval = 1;
  let maxLabels = count;

  switch (period) {
    case "7d":
      maxLabels = 7;
      break;
    case "30d":
      maxLabels = 7;
      break;
    case "90d":
      maxLabels = 6;
      break;
    case "180d":
      maxLabels = 6;
      break;
    case "1y":
      maxLabels = 12;
      break;
  }

  labelInterval = Math.max(1, Math.ceil(count / maxLabels));

  return data.map((d, i) => ({
    x: (i + 0.5) * stepX,
    label: shouldShowLabel(i, count, labelInterval, period, data) ? formatXLabel(d.date, period) : "",
    width: stepX,
  }));
}

function shouldShowLabel(index: number, count: number, interval: number, period: Period, data: { label: string; value: number; date: string }[]): boolean {
  if (count <= 7) return true;
  if (period === "1y" || period === "90d" || period === "180d") {
    // Show month boundaries
    const date = new Date(data[index].date + "T00:00:00");
    return date.getDate() === 1 || index === 0 || index === count - 1;
  }
  return index % interval === 0 || index === 0 || index === count - 1;
}

function formatXLabel(dateStr: string, period: Period): string {
  const date = new Date(dateStr + "T00:00:00");
  switch (period) {
    case "7d":
      return date.toLocaleDateString("en-GB", { weekday: "short" });
    case "30d":
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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

  const CHART_COLORS = [
  "#8FAFA5", // sage (primary)
  "#E8A87C", // warm sand
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

  const lineChartData = useMemo(() => {
    // Generate proper data points based on period granularity
    // 7d, 30d → daily; 3M, 6M, 1Y → monthly
    
    if (period === "7d" || period === "30d") {
      // Daily aggregation
      const allDates = Array.from({ length: periodDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (periodDays - 1 - i));
        return d.toISOString().split("T")[0];
      });

      const dailyTotals = new Map<string, number>();
      periodItems.forEach(item => {
        const day = item.createdAt.split("T")[0];
        dailyTotals.set(day, (dailyTotals.get(day) || 0) + item.amount);
      });

      return allDates.map(day => ({
        label: period === "7d" 
          ? new Date(day + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" })
          : new Date(day + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        value: dailyTotals.get(day) || 0,
        date: day,
      }));
    }

    // Monthly aggregation for 3M, 6M, 1Y
    const monthsBack = period === "90d" ? 3 : period === "180d" ? 6 : 12;
    const monthlyTotals = new Map<string, number>();
    
    periodItems.forEach(item => {
      const date = new Date(item.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + item.amount);
    });

    // Generate all months in range
    const allMonths: string[] = [];
    const now = new Date();
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      allMonths.push(monthKey);
    }

    return allMonths.map(monthKey => {
      const [year, month] = monthKey.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return {
        label: date.toLocaleDateString("en-GB", { month: "short" }),
        value: monthlyTotals.get(monthKey) || 0,
        date: monthKey,
      };
    });
  }, [periodItems, periodDays, period]);

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
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
        {/* Spending Overview */}
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-5 min-w-0 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-dash-text">Spending overview</h2>
              <p className="text-[12px] text-dash-text-muted mt-0.5">Your spending over time</p>
            </div>
            <PeriodSelector selected={period} onChange={setPeriod} />
          </div>

          {periodItems.length > 0 ? (
            <div className="group min-w-0 overflow-hidden flex-1">
              <LineChart data={lineChartData} period={period} />
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
        <div className="bg-dash-card border border-dash-border rounded-xl p-5 space-y-5 min-w-0">
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