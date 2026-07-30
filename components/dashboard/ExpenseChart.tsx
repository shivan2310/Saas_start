"use client";

import React from "react";
import Link from "next/link";
import { Expense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { TrendingUp, ArrowUpRight, BarChart3, Wallet, Tag } from "lucide-react";

interface ExpenseChartProps {
  expenses: Expense[];
  interactive?: boolean;
}

export const ExpenseChart: React.FC<ExpenseChartProps> = ({
  expenses,
  interactive = true,
}) => {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + item.amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const maxCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;
  const topCategory = sortedCategories[0];
  const avgExpense = expenses.length > 0 ? total / expenses.length : 0;

  const displayCategories = sortedCategories.slice(0, 6);

  const content = (
    <Card className={`transition-all duration-200 ${interactive ? "hover:border-black/50 hover:shadow-md cursor-pointer group" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-black">
            <BarChart3 className="h-4 w-4" />
            Expense Bar Chart & Insights
          </CardTitle>
          <CardDescription className="text-xs text-muted mt-0.5">
            Visual breakdown of spending by category
          </CardDescription>
        </div>
        {interactive && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-black group-hover:underline">
            View Details <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        {/* Insights Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Wallet className="h-3.5 w-3.5" /> Total Spent
            </div>
            <div className="mt-1 text-lg font-bold text-black">₹{total.toFixed(2)}</div>
          </div>

          <div className="rounded border border-border bg-surface p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <Tag className="h-3.5 w-3.5" /> Top Category
            </div>
            <div className="mt-1 text-sm font-bold text-black truncate">
              {topCategory ? `${topCategory[0]} (${Math.round((topCategory[1] / (total || 1)) * 100)}%)` : "N/A"}
            </div>
          </div>

          <div className="rounded border border-border bg-surface p-3 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-xs text-muted font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> Average / Expense
            </div>
            <div className="mt-1 text-lg font-bold text-black">₹{avgExpense.toFixed(2)}</div>
          </div>
        </div>

        {/* Vertical Bar Graph Visual */}
        {expenses.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
              <span>Category Bar Graph</span>
              <span>Max: ₹{maxCategoryAmount.toFixed(0)}</span>
            </div>

            {/* Vertical Bar Chart Container */}
            <div className="relative pt-6 pb-2 border-b border-border">
              {/* Y-Axis Grid Guidelines */}
              <div className="absolute inset-x-0 top-6 border-b border-dashed border-border/50" />
              <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-border/30" />

              {/* Bars Row */}
              <div className="relative z-10 flex items-end justify-around h-44 sm:h-52 gap-2 px-2">
                {displayCategories.map(([cat, amount], idx) => {
                  const barHeightPercent = maxCategoryAmount > 0
                    ? Math.max(Math.round((amount / maxCategoryAmount) * 100), 8)
                    : 8;
                  const percentageOfTotal = total > 0 ? Math.round((amount / total) * 100) : 0;

                  // Bar color gradient styles (black/dark accents)
                  const barColors = [
                    "bg-black hover:bg-neutral-800",
                    "bg-neutral-800 hover:bg-neutral-700",
                    "bg-neutral-700 hover:bg-neutral-600",
                    "bg-neutral-600 hover:bg-neutral-500",
                    "bg-neutral-500 hover:bg-neutral-400",
                    "bg-neutral-400 hover:bg-neutral-300",
                  ];
                  const barBg = barColors[idx % barColors.length];

                  return (
                    <div
                      key={cat}
                      className="flex flex-col items-center flex-1 h-full justify-end group/bar max-w-[72px]"
                    >
                      {/* Floating Amount Label above bar */}
                      <span className="text-[10px] sm:text-xs font-semibold text-black mb-1 opacity-90 transition-opacity">
                        ₹{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount.toFixed(0)}
                      </span>

                      {/* Vertical Bar Pill */}
                      <div className="w-full bg-surface rounded-t border-x border-t border-border/40 overflow-hidden flex flex-col justify-end h-full">
                        <div
                          className={`w-full rounded-t transition-all duration-500 ${barBg}`}
                          style={{ height: `${barHeightPercent}%` }}
                          title={`${cat}: ₹${amount.toFixed(2)} (${percentageOfTotal}% of total)`}
                        />
                      </div>

                      {/* Category Label below bar */}
                      <span className="mt-2 text-[10px] sm:text-xs font-medium text-black truncate w-full text-center">
                        {cat}
                      </span>
                      <span className="text-[9px] text-muted font-normal">
                        {percentageOfTotal}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {sortedCategories.length > 6 && (
              <p className="text-[11px] text-muted text-right">
                +{sortedCategories.length - 6} more categories
              </p>
            )}

            {/* Smart Automated Insight Note */}
            <div className="mt-4 rounded bg-surface/80 border border-border p-3 text-xs text-muted flex items-start gap-2">
              <span className="font-semibold text-black shrink-0">Insight:</span>
              <span>
                {topCategory
                  ? `Your highest expenditure is on ${topCategory[0]}, accounting for ${Math.round((topCategory[1] / (total || 1)) * 100)}% of your total tracked expenses.`
                  : "Start logging your daily expenses to receive personalized insights."}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-border rounded">
            <p className="text-sm font-medium text-black">No expenses recorded yet</p>
            <p className="text-xs text-muted mt-1">
              Add your first expense to see your vertical bar graph.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (interactive) {
    return <Link href="/dashboard/expenses" className="block">{content}</Link>;
  }

  return content;
};
