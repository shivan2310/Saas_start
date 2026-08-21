"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { personalService } from "@/services/personalService";
import { todoService } from "@/services/todoService";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { Expense, ImportantDate, TodoItem, DiaryEntry } from "@/types";
import { Button } from "@/components/ui/Button";
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

  useEffect(() => {
    if (!user) return;

    setLoadingOverview(true);
    Promise.all([
      personalService.getExpenses(user.uid),
      todoService.getUserTodos(user.uid),
      personalService.getDates(user.uid),
      personalService.getDiary(user.uid)
    ])
      .then(([expensesData, todosData, datesData, diaryData]) => {
        setExpenses(expensesData);
        setTodos(todosData);
        setImportantDates(datesData);
        setDiaryEntries(diaryData);
      })
      .catch(console.error)
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
              <h4 className="text-[13px] font-semibold text-dash-text">Email Verification Pending</h4>
              <p className="text-[12px] text-dash-text-muted mt-0.5">
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

      {/* Greeting Header */}
      <div>
        <h2 className="text-[28px] font-semibold tracking-tight text-dash-text leading-tight">
          {getGreeting()}, {profile?.displayName?.split(' ')[0] || "User"}.
        </h2>
        <p className="text-[14px] text-dash-text-secondary mt-1">
          Here's what's happening with your day.
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
                <span className="text-[13px] font-medium uppercase tracking-wider">To-dos</span>
              </div>
              <span className="text-[11px] text-dash-text-muted">{todos.filter(t => !t.done).length} remaining</span>
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
                  <div key={todo.id} className="flex items-start gap-2.5">
                    <Circle className="h-3.5 w-3.5 shrink-0 text-dash-text-muted mt-0.5" />
                    <span className="text-[13px] text-dash-text truncate">{todo.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-dash-text-muted py-4">All caught up.</div>
              )}
            </div>

            <Link href="/dashboard/tasks" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-dash">
              Open tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Upcoming Dates & Journal Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Important Dates */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <CalendarDays className="h-4 w-4" />
                <span className="text-[13px] font-medium uppercase tracking-wider">Important Dates</span>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[100px]">
                {loadingOverview ? (
                  <Skeleton className="h-6 w-1/2" />
                ) : nextDate ? (
                  <div>
                    <div className="text-[12px] text-dash-text-muted mb-1">{formatDate(`${nextDate.date}T00:00:00`)}</div>
                    <div className="text-[15px] font-medium text-dash-text truncate">{nextDate.title}</div>
                    {nextDate.notes && (
                      <div className="text-[12px] text-dash-text-muted mt-1 line-clamp-1 truncate">
                        {nextDate.notes}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-[13px] text-dash-text-muted">No upcoming dates.</div>
                )}
              </div>

              <Link href="/dashboard/dates" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-dash">
                View calendar <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Journal */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <BookOpen className="h-4 w-4" />
                <span className="text-[13px] font-medium uppercase tracking-wider">Journal</span>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[100px] overflow-hidden">
                {loadingOverview ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : latestDiary ? (
                  <div className="flex flex-col min-h-0">
                    <div className="text-[12px] text-dash-text-muted mb-1 shrink-0">{formatDate(latestDiary.createdAt)}</div>
                    <div className="text-[14px] font-medium text-dash-text truncate shrink-0">{latestDiary.title}</div>
                    <div className="text-[12px] text-dash-text-muted mt-1 line-clamp-2 overflow-hidden">
                      {latestDiary.content}
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] text-dash-text-muted">No entries yet.</div>
                )}
              </div>

              <Link href="/dashboard/diary" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-dash">
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
                <span className="text-[13px] font-medium uppercase tracking-wider">Expenses</span>
              </div>

              <div className="flex-1 flex flex-col justify-center min-h-[100px]">
                {loadingOverview ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                ) : (
                  <div>
                    <div className="text-[12px] text-dash-text-muted mb-1">Total spent this month</div>
                    <div className="text-[24px] font-semibold text-dash-text">
                      ₹{totalSpent.toLocaleString()}
                    </div>
                    {sortedCategories.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {sortedCategories.slice(0, 3).map(([cat, amt]) => (
                          <div key={cat} className="flex items-center justify-between text-[12px]">
                            <span className="text-dash-text-secondary">{cat}</span>
                            <span className="text-dash-text font-medium">₹{amt.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Link href="/dashboard/expenses" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-dash">
                View analytics <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="rounded-lg border border-dash-border bg-dash-card p-5">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <Tag className="h-4 w-4" />
                <span className="text-[13px] font-medium uppercase tracking-wider">Quick Actions</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/dashboard/tasks"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-surface hover:bg-dash-hover transition-dash group"
                >
                  <Plus className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[13px] text-dash-text">Add task</span>
                </Link>
                <Link
                  href="/dashboard/expenses"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-surface hover:bg-dash-hover transition-dash group"
                >
                  <Wallet className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[13px] text-dash-text">Add expense</span>
                </Link>
                <Link
                  href="/dashboard/dates"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-surface hover:bg-dash-hover transition-dash group"
                >
                  <CalendarDays className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[13px] text-dash-text">Add date</span>
                </Link>
                <Link
                  href="/dashboard/diary"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-dash-surface hover:bg-dash-hover transition-dash group"
                >
                  <BookOpen className="h-4 w-4 text-dash-text-muted group-hover:text-dash-accent transition-dash" />
                  <span className="text-[13px] text-dash-text">New entry</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity & Stats */}
        <div className="lg:col-span-4 space-y-6">
          {/* Expense Trend Mini Chart */}
          {expenses.length > 0 && (
            <div className="rounded-lg border border-dash-border bg-dash-card p-5">
              <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[13px] font-medium uppercase tracking-wider">Spending Trend</span>
              </div>
              <div className="h-32 flex items-end justify-between gap-1.5">
                {(() => {
                  const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    return d.toISOString().split('T')[0];
                  });
                  const dailyTotals = last7Days.map(day => 
                    expenses
                      .filter(e => e.createdAt.startsWith(day))
                      .reduce((sum, e) => sum + e.amount, 0)
                  );
                  const maxDaily = Math.max(...dailyTotals, 1);
                  return dailyTotals.map((amt, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end">
                      <div
                        className="w-full max-w-[32px] bg-dash-border rounded-t hover:bg-dash-accent transition-dash"
                        style={{ height: `${Math.max((amt / maxDaily) * 100, 3)}%` }}
                      />
                      <span className="mt-1.5 text-[10px] text-dash-text-muted">
                        {new Date(last7Days[i]).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5">
            <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
              <Clock className="h-4 w-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Recent Activity</span>
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
                  <div className="text-[13px] text-dash-text-muted py-4">No recent activity.</div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.date} className="space-y-2">
                      <div className="text-[11px] font-medium text-dash-text-muted uppercase tracking-wider">{activity.date}</div>
                      <div className="space-y-1.5 pl-2 border-l border-dash-border">
                        {activity.items.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="text-[12px] text-dash-text-secondary pb-2 last:pb-0">
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
