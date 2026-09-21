"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { personalService } from "@/services/personalService";
import { todoService } from "@/services/todoService";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { Expense, ImportantDate, TodoItem, DiaryEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn, formatDate } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  ListTodo,
  BookOpen,
  Wallet,
  Plus,
  TrendingUp,
  Tag,
  Clock,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile, isEmailVerified } = useAuth();
  const { toast } = useToast();
  const [sendingVerification, setSendingVerification] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [trendView, setTrendView] = useState<"7d" | "recent">("7d");

  useEffect(() => {
    if (!user) return;

    setLoadingOverview(true);
    Promise.allSettled([
      personalService.getExpenses(user.uid),
      todoService.getUserTodos(user.uid),
      personalService.getDates(user.uid),
      personalService.getDiary(user.uid)
    ])
      .then(([expensesRes, todosRes, datesRes, diaryRes]) => {
        if (expensesRes.status === 'fulfilled') {
          const expList = expensesRes.value;
          setExpenses(expList);
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          const hasRecent7d = expList.some((e) => e.createdAt && new Date(e.createdAt).getTime() >= sevenDaysAgo.getTime());
          if (!hasRecent7d && expList.length > 0) {
            setTrendView("recent");
          }
        }
        else console.error("Failed to load expenses:", expensesRes.reason);
        
        if (todosRes.status === 'fulfilled') setTodos(todosRes.value);
        else console.error("Failed to load todos:", todosRes.reason);
        
        if (datesRes.status === 'fulfilled') setImportantDates(datesRes.value);
        else console.error("Failed to load dates:", datesRes.reason);
        
        if (diaryRes.status === 'fulfilled') setDiaryEntries(diaryRes.value);
        else console.error("Failed to load diary:", diaryRes.reason);
      })
      .finally(() => setLoadingOverview(false));
  }, [user]);

  const handleResendVerification = async () => {
    if (!user) return;
    setSendingVerification(true);
    try {
      await authService.sendVerificationEmail(user);
      toast({
        type: "success",
        title: "Verification Email Sent",
        description: "Please check your inbox to confirm your email.",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      toast({
        type: "error",
        title: "Error",
        description: getAuthErrorMessage(
          error,
          "Could not send verification email. Try again later."
        ),
      });
    } finally {
      setSendingVerification(false);
    }
  };

  const handleToggleTodo = async (id: string, currentDone: boolean) => {
    try {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !currentDone } : t))
      );
      await todoService.toggleTodo(id, !currentDone);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: currentDone } : t))
      );
      toast({ type: "error", title: "Error", description: "Could not update task." });
    }
  };

  const previewTodos = todos.filter(t => !t.done).slice(0, 3);
  const nextDate = [...importantDates].sort((a, b) => a.date.localeCompare(b.date))[0];
  const latestDiary = diaryEntries[0];
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryTotals = expenses.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + item.amount;
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <div className="rounded-lg border border-dash-border bg-dash-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-dash-text shrink-0" />
            <div>
              <h2 className="text-[14px] font-semibold text-dash-text">Email Verification Pending</h2>
              <p className="text-[13px] text-dash-text-muted mt-0.5">
                Please verify your email address ({user?.email}) to secure your account.
              </p>
            </div>
          </div>
          <Button
            size="dash-sm"
            variant="dash-secondary"
            onClick={handleResendVerification}
            isLoading={sendingVerification}
            className="shrink-0"
          >
            Resend Email
          </Button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-dash-text leading-tight">
          Overview
        </h1>
        <p className="text-[16px] text-dash-text-secondary mt-1">
          {getGreeting()}, {profile?.displayName?.split(' ')[0] || "User"}. Here's what's happening with your day.
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Main Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Focus - To-dos */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-dash-text-secondary">
                <ListTodo className="h-4 w-4" />
                <h2 className="text-[13px] font-medium uppercase tracking-wider">To-dos</h2>
              </div>
              <span className="text-[12px] text-dash-text-muted">{todos.filter(t => !t.done).length} remaining</span>
            </div>

            <div className="flex-1 space-y-3 overflow-hidden min-h-[140px]">
              {loadingOverview ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : previewTodos.length > 0 ? (
                previewTodos.map((todo) => (
                  <div key={todo.id} className="flex items-start gap-2.5 group">
                    <button
                      onClick={() => handleToggleTodo(todo.id, todo.done)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-dash mt-0.5",
                        todo.done 
                          ? "bg-dash-accent border-dash-accent text-dash-background" 
                          : "border-dash-border hover:border-dash-text text-transparent"
                      )}
                    >
                      {todo.done && <Check className="h-3 w-3" strokeWidth={3} />}
                    </button>
                    <span 
                      className={cn(
                        "text-[15px] truncate transition-dash cursor-pointer",
                        todo.done ? "text-dash-text-muted line-through" : "text-dash-text"
                      )}
                      onClick={() => handleToggleTodo(todo.id, todo.done)}
                    >
                      {todo.text}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-[14px] text-dash-text-muted py-4">All caught up.</div>
              )}
            </div>

            <Link href="/dashboard/tasks" className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-dash-text hover:text-dash-accent transition-dash">
              Open tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Upcoming Dates & Journal Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Important Dates */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <CalendarDays className="h-4 w-4" />
                <h2 className="text-[13px] font-medium uppercase tracking-wider">Important Dates</h2>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[100px]">
                {loadingOverview ? (
                  <Skeleton className="h-6 w-1/2" />
                ) : nextDate ? (
                  <div>
                    <div className="text-[13px] text-dash-text-muted mb-1">{formatDate(`${nextDate.date}T00:00:00`)}</div>
                    <div className="text-[16px] font-medium text-dash-text truncate">{nextDate.title}</div>
                    {nextDate.notes && (
                      <div className="text-[13px] text-dash-text-muted mt-1 line-clamp-1 truncate">
                        {nextDate.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[14px] text-dash-text-muted">No upcoming dates.</div>
                )}
              </div>

              <Link href="/dashboard/dates" className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-dash-text hover:text-dash-accent transition-dash">
                View calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Journal */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <BookOpen className="h-4 w-4" />
                <h2 className="text-[13px] font-medium uppercase tracking-wider">Journal</h2>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[100px] overflow-hidden">
                {loadingOverview ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : latestDiary ? (
                  <div className="flex flex-col min-h-0">
                    <div className="text-[13px] text-dash-text-muted mb-1 shrink-0">{formatDate(latestDiary.createdAt)}</div>
                    <div className="text-[16px] font-medium text-dash-text truncate shrink-0">{latestDiary.title}</div>
                    <div className="text-[14px] text-dash-text-muted mt-1 line-clamp-2 overflow-hidden">
                      {latestDiary.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-[14px] text-dash-text-muted">No entries yet.</div>
                )}
              </div>

              <Link href="/dashboard/diary" className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-dash-text hover:text-dash-accent transition-dash">
                Write entry <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Expenses & Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expenses Summary */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <Wallet className="h-4 w-4" />
                <h2 className="text-[13px] font-medium uppercase tracking-wider">Expenses</h2>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[100px]">
                {loadingOverview ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                ) : (
                  <div>
                    <div className="text-[13px] text-dash-text-muted mb-1">Total spent this month</div>
                    <div className="text-[24px] font-semibold text-dash-text">
                      ₹{totalSpent.toLocaleString()}
                    </div>
                    {sortedCategories.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {sortedCategories.slice(0, 3).map(([cat, amt]) => (
                          <div key={cat} className="flex items-center justify-between text-[14px]">
                            <span className="text-dash-text-secondary">{cat}</span>
                            <span className="text-dash-text font-medium">₹{amt.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/dashboard/expenses" className="mt-4 flex items-center gap-1.5 text-[13px] font-medium text-dash-text hover:text-dash-accent transition-dash">
                View analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <Tag className="h-4 w-4" />
                <h2 className="text-[13px] font-medium uppercase tracking-wider">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/dashboard/tasks"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-elevated border border-dash-border-secondary/60 hover:bg-dash-hover transition-dash group"
                >
                  <Plus className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[14px] text-dash-text">Add task</span>
                </Link>
                <Link
                  href="/dashboard/expenses"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-elevated border border-dash-border-secondary/60 hover:bg-dash-hover transition-dash group"
                >
                  <Wallet className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[14px] text-dash-text">Add expense</span>
                </Link>
                <Link
                  href="/dashboard/dates"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-elevated border border-dash-border-secondary/60 hover:bg-dash-hover transition-dash group"
                >
                  <CalendarDays className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[14px] text-dash-text">Add date</span>
                </Link>
                <Link
                  href="/dashboard/diary"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-elevated border border-dash-border-secondary/60 hover:bg-dash-hover transition-dash group"
                >
                  <BookOpen className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[14px] text-dash-text">New entry</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Expense Trend Mini Chart */}
          {expenses.length > 0 && (() => {
            function toLocalDateKey(date: Date | string | undefined | null): string {
              if (!date) return "";
              const d = typeof date === "string" ? new Date(date) : date;
              if (isNaN(d.getTime())) return "";
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, "0");
              const day = String(d.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }

            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(today.getDate() - (6 - i));
              return {
                key: toLocalDateKey(d),
                label: d.toLocaleDateString(undefined, { weekday: "short" }),
                fullDate: d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
              };
            });

            const expensesByDay = new Map<string, number>();
            expenses.forEach((e) => {
              if (!e.createdAt) return;
              const key = toLocalDateKey(e.createdAt);
              if (key) {
                expensesByDay.set(key, (expensesByDay.get(key) || 0) + Number(e.amount || 0));
              }
            });

            const dailyData = last7Days.map((day) => ({
              label: day.label,
              tooltipTitle: day.fullDate,
              amount: expensesByDay.get(day.key) || 0,
            }));

            const total7Days = dailyData.reduce((sum, d) => sum + d.amount, 0);

            // Previous 7-day period (days 7 to 13 ago)
            const prev7DaysKeys = new Set(
              Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(today.getDate() - (13 - i));
                return toLocalDateKey(d);
              })
            );
            const totalPrev7Days = expenses
              .filter((e) => e.createdAt && prev7DaysKeys.has(toLocalDateKey(e.createdAt)))
              .reduce((sum, e) => sum + Number(e.amount || 0), 0);

            let trendBadge = "";
            if (totalPrev7Days > 0) {
              const diff = Math.round(((total7Days - totalPrev7Days) / totalPrev7Days) * 100);
              trendBadge = `${diff >= 0 ? "+" : ""}${diff}% vs prev week`;
            } else if (total7Days > 0) {
              trendBadge = "Active this week";
            } else {
              trendBadge = "0 expenses this week";
            }

            // Recent entries
            const sortedRecent = [...expenses]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 7)
              .reverse();

            const recentData = sortedRecent.map((e) => {
              const d = new Date(e.createdAt);
              return {
                label: !isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—",
                tooltipTitle: `${e.category || "Expense"} · ${!isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}`,
                amount: Number(e.amount || 0),
              };
            });

            const currentData = trendView === "7d" ? dailyData : (recentData.length > 0 ? recentData : dailyData);
            const maxDaily = Math.max(...currentData.map((d) => d.amount), 1);
            const currentTotal = trendView === "7d" ? total7Days : recentData.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-dash-text-secondary">
                    <TrendingUp className="h-4 w-4 text-dash-accent" />
                    <h2 className="text-[13px] font-medium uppercase tracking-wider">Spending Trend</h2>
                  </div>
                  <div className="flex items-center gap-1 rounded bg-dash-elevated p-0.5 text-[11px]">
                    <button
                      onClick={() => setTrendView("7d")}
                      className={cn(
                        "px-2 py-0.5 rounded transition-dash font-medium",
                        trendView === "7d"
                          ? "bg-dash-card text-dash-text shadow-sm"
                          : "text-dash-text-muted hover:text-dash-text"
                      )}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setTrendView("recent")}
                      className={cn(
                        "px-2 py-0.5 rounded transition-dash font-medium",
                        trendView === "recent"
                          ? "bg-dash-card text-dash-text shadow-sm"
                          : "text-dash-text-muted hover:text-dash-text"
                      )}
                    >
                      Recent
                    </button>
                  </div>
                </div>

                {/* Amount and Trend Badge */}
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-[20px] font-bold text-dash-text">
                      ₹{currentTotal.toLocaleString()}
                    </span>
                    <span className="text-[12px] text-dash-text-muted ml-1.5 font-normal">
                      {trendView === "7d" ? "last 7 days" : "last 7 entries"}
                    </span>
                  </div>
                  {trendView === "7d" && (
                    <span className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded",
                      trendBadge.includes("+") 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : trendBadge.includes("-")
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-dash-elevated text-dash-text-muted"
                    )}>
                      {trendBadge}
                    </span>
                  )}
                </div>

                {/* Chart Plot Area */}
                <div className="h-28 flex items-end justify-between gap-2 px-1">
                  {currentData.map((pt, i) => {
                    const heightPercent = maxDaily > 0 && pt.amount > 0
                      ? Math.max(Math.round((pt.amount / maxDaily) * 100), 12)
                      : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                        {/* Tooltip on hover */}
                        <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-20 hidden group-hover:flex flex-col items-center bg-dash-text text-dash-background text-[11px] font-medium px-2 py-0.5 rounded shadow whitespace-nowrap">
                          <span>{pt.tooltipTitle}</span>
                          <span className="font-semibold text-dash-accent">₹{pt.amount.toLocaleString()}</span>
                        </div>

                        {/* Visual Bar with Track */}
                        <div className="w-full max-w-[28px] h-full flex flex-col justify-end items-center rounded-t overflow-hidden bg-dash-elevated border border-dash-border-secondary/60">
                          <div
                            className={cn(
                              "w-full rounded-t transition-all duration-300",
                              pt.amount > 0
                                ? "bg-dash-accent group-hover:brightness-110"
                                : "h-[3px] bg-dash-border-secondary"
                            )}
                            style={{ height: pt.amount > 0 ? `${heightPercent}%` : "3px" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Baseline & Day Labels */}
                <div className="border-t border-dash-border-secondary pt-2 px-1 flex items-center justify-between gap-2">
                  {currentData.map((pt, i) => (
                    <div key={i} className="flex-1 text-center truncate">
                      <span className="text-[12px] font-medium text-dash-text-muted">
                        {pt.label}
                      </span>
                    </div>
                  ))}
                </div>

                {trendView === "7d" && total7Days === 0 && expenses.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-dash-border-secondary/60 text-center">
                    <button
                      onClick={() => setTrendView("recent")}
                      className="text-[12px] text-dash-accent hover:underline font-medium"
                    >
                      No spending in last 7 days · View recent entries →
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Recent Activity */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5">
            <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
              <Clock className="h-4 w-4" />
              <h2 className="text-[13px] font-medium uppercase tracking-wider">Recent Activity</h2>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {(() => {
                const activities: Array<{ date: string; items: string[] }> = [];
                const todayStr = new Date().toISOString().split('T')[0];
                const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                const todayItems: string[] = [];
                const yesterdayItems: string[] = [];

                todos.filter(t => t.done && t.createdAt.startsWith(todayStr)).forEach(t => {
                  todayItems.push(`Completed "${t.text}"`);
                });
                expenses.filter(e => e.createdAt.startsWith(todayStr)).forEach(e => {
                  todayItems.push(`Added expense ₹${e.amount}`);
                });
                diaryEntries.filter(d => d.createdAt.startsWith(todayStr)).forEach(d => {
                  todayItems.push(`Created journal entry`);
                });
                importantDates.filter(d => d.createdAt.startsWith(todayStr)).forEach(d => {
                  todayItems.push(`Added important date`);
                });

                todos.filter(t => t.done && t.createdAt.startsWith(yesterdayStr)).forEach(t => {
                  yesterdayItems.push(`Completed "${t.text}"`);
                });
                expenses.filter(e => e.createdAt.startsWith(yesterdayStr)).forEach(e => {
                  yesterdayItems.push(`Added expense ₹${e.amount}`);
                });
                diaryEntries.filter(d => d.createdAt.startsWith(yesterdayStr)).forEach(d => {
                  yesterdayItems.push(`Created journal entry`);
                });
                importantDates.filter(d => d.createdAt.startsWith(yesterdayStr)).forEach(d => {
                  yesterdayItems.push(`Added important date`);
                });

                if (todayItems.length > 0) activities.push({ date: "Today", items: todayItems });
                if (yesterdayItems.length > 0) activities.push({ date: "Yesterday", items: yesterdayItems });

                return activities.length === 0 ? (
                  <div className="text-[14px] text-dash-text-muted py-4">No recent activity.</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.date} className="space-y-2">
                      <div className="text-[12px] font-medium text-dash-text-muted uppercase tracking-wider">{activity.date}</div>
                      <div className="space-y-1.5 pl-2 border-l border-dash-border">
                        {activity.items.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="text-[13px] text-dash-text-secondary pb-2 last:pb-0">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
