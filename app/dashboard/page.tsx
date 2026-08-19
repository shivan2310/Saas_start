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
  Wallet
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <div className="rounded border border-dash-border bg-dash-card p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-dash-text shrink-0" />
            <div>
              <h4 className="text-[13px] font-semibold text-dash-text">Email Verification Pending</h4>
              <p className="text-[11px] text-dash-text-muted mt-0.5">
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

      <div className="space-y-4">
        <h3 className="text-[16px] font-semibold text-dash-text">Today's focus</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* To-dos */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col h-[220px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-dash-text-secondary">
                <ListTodo className="h-4 w-4" />
                <span className="text-[13px] font-medium uppercase tracking-wider">To-dos</span>
              </div>
              <span className="text-[11px] text-dash-text-muted">{todos.filter(t => !t.done).length} remaining</span>
            </div>
            
            <div className="flex-1 space-y-3 overflow-hidden">
              {loadingOverview ? (
                <div className="text-[13px] text-dash-text-muted">Loading...</div>
              ) : previewTodos.length > 0 ? (
                previewTodos.map((todo) => (
                  <div key={todo.id} className="flex items-start gap-2.5">
                    <Circle className="h-3.5 w-3.5 shrink-0 text-dash-text-muted mt-0.5" />
                    <span className="text-[13px] text-dash-text truncate">{todo.text}</span>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-dash-text-muted">All caught up.</div>
              )}
            </div>
            
            <Link href="/dashboard/tasks" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-colors">
              Open tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Important Dates */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col h-[220px]">
            <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
              <CalendarDays className="h-4 w-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Important Dates</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {loadingOverview ? (
                <div className="text-[13px] text-dash-text-muted">Loading...</div>
              ) : nextDate ? (
                <div>
                  <div className="text-[13px] text-dash-text-muted mb-1">{formatDate(`${nextDate.date}T00:00:00`)}</div>
                  <div className="text-[16px] font-medium text-dash-text truncate">{nextDate.title}</div>
                </div>
              ) : (
                <div className="text-[13px] text-dash-text-muted">No upcoming dates.</div>
              )}
            </div>
            
            <Link href="/dashboard/dates" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-colors">
              View calendar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Journal */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col h-[220px]">
            <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
              <BookOpen className="h-4 w-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Journal</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {loadingOverview ? (
                <div className="text-[13px] text-dash-text-muted">Loading...</div>
              ) : latestDiary ? (
                <div>
                  <div className="text-[13px] text-dash-text-muted mb-1">{formatDate(latestDiary.createdAt)}</div>
                  <div className="text-[14px] font-medium text-dash-text truncate">{latestDiary.title}</div>
                </div>
              ) : (
                <div className="text-[13px] text-dash-text-muted">No entries yet.</div>
              )}
            </div>
            
            <Link href="/dashboard/diary" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-colors">
              Write entry <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Expenses */}
          <div className="rounded-lg border border-dash-border bg-dash-card p-5 flex flex-col h-[220px]">
            <div className="flex items-center gap-2 text-dash-text-secondary mb-4">
              <Wallet className="h-4 w-4" />
              <span className="text-[13px] font-medium uppercase tracking-wider">Expenses</span>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              {loadingOverview ? (
                <div className="text-[13px] text-dash-text-muted">Loading...</div>
              ) : (
                <div>
                  <div className="text-[13px] text-dash-text-muted mb-1">Total spent</div>
                  <div className="text-[24px] font-semibold text-dash-text">
                    ₹{totalSpent.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/dashboard/expenses" className="mt-4 flex items-center gap-1.5 text-[12px] font-medium text-dash-text hover:text-dash-accent transition-colors">
              View analytics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
