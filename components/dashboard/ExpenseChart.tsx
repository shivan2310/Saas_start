"use client";

import React from "react";
import Link from "next/link";
import { Expense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { TrendingUp, ArrowUpRight, PieChart as PieIcon, Wallet, Tag } from "lucide-react";

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
  const topCategory = sortedCategories[0];
  const avgExpense = expenses.length > 0 ? total / expenses.length : 0;

  const content = (
    <Card className={`transition-all duration-200 ${interactive ? "hover:border-black/50 hover:shadow-md cursor-pointer group" : ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-black">
            <PieIcon className="h-4 w-4" />
            Expense Analytics & Insights
          </CardTitle>
          <CardDescription className="text-xs text-muted mt-0.5">
            Graphical breakdown of your spending habits
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

        {/* Graphical Bar Chart */}
        {expenses.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted uppercase tracking-wider">
              <span>Category Breakdown</span>
              <span>Amount (% of Total)</span>
            </div>

            <div className="space-y-2.5">
              {sortedCategories.slice(0, 5).map(([cat, amount], idx) => {
                const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                const opacityClasses = [
                  "bg-black",
                  "bg-neutral-800",
                  "bg-neutral-600",
                  "bg-neutral-500",
                  "bg-neutral-400",
                ];
                const barColor = opacityClasses[idx % opacityClasses.length];

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-black">{cat}</span>
                      <span className="text-black font-semibold">
                        ₹{amount.toFixed(2)} <span className="text-muted text-[11px]">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-surface overflow-hidden border border-border/50">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedCategories.length > 5 && (
              <p className="text-[11px] text-muted text-right">
                +{sortedCategories.length - 5} more categories
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
          <div className="py-8 text-center border border-dashed border-border rounded">
            <p className="text-sm text-muted">No expenses recorded yet.</p>
            <p className="text-xs text-muted mt-1">
              Add your first expense to see graphical insights.
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
