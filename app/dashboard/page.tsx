"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { personalService } from "@/services/personalService";
import { todoService } from "@/services/todoService";
import { getAuthErrorMessage } from "@/lib/authErrors";
import { Expense, ImportantDate, TodoItem } from "@/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn, formatDate } from "@/lib/utils";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  ListTodo,
} from "lucide-react";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";

export default function DashboardPage() {
  const { user, profile, isEmailVerified } = useAuth();
  const { toast } = useToast();
  const [sendingVerification, setSendingVerification] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoadingOverview(true);
    Promise.all([
      personalService.getExpenses(user.uid),
      todoService.getUserTodos(user.uid),
      personalService.getDates(user.uid),
    ])
      .then(([expensesData, todosData, datesData]) => {
        setExpenses(expensesData);
        setTodos(todosData);
        setImportantDates(datesData);
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

  const previewTodos = todos.slice(0, 6);
  const previewDates = [...importantDates]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <div className="rounded border border-black bg-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-black shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-black">Email Verification Pending</h4>
              <p className="text-xs text-muted">
                Please verify your email address (<strong>{user?.email}</strong>) to secure your account.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="default"
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
        <h2 className="text-2xl font-bold tracking-tight text-black">
          Welcome back, {profile?.displayName || "User"}
        </h2>
        <p className="text-xs text-muted mt-1">
          Keep your day, money, memories, and important dates close at hand.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <ListTodo className="h-4 w-4" />
                To dos
              </CardTitle>
              <CardDescription>Latest tasks from your todo list</CardDescription>
            </div>
            <Link
              href="/dashboard/tasks"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-black hover:underline"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingOverview ? (
              <p className="py-8 text-center text-xs text-muted">Loading todos...</p>
            ) : previewTodos.length ? (
              previewTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded border border-border bg-surface px-3 py-2.5",
                    todo.done && "opacity-65"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {todo.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-black" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted" />
                    )}
                    <Link
                      href="/dashboard/tasks"
                      className={cn(
                        "truncate text-sm font-medium text-black hover:underline",
                        todo.done && "text-muted line-through"
                      )}
                    >
                      {todo.text}
                    </Link>
                  </div>
                  <span className="shrink-0 rounded border border-border bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
                    {todo.priority}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted">No todos yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <CalendarDays className="h-4 w-4" />
                Important dates
              </CardTitle>
              <CardDescription>Upcoming moments and appointments</CardDescription>
            </div>
            <Link
              href="/dashboard/dates"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-black hover:underline"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingOverview ? (
              <p className="py-8 text-center text-xs text-muted">Loading dates...</p>
            ) : previewDates.length ? (
              previewDates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded border border-border bg-surface px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <Link
                      href="/dashboard/dates"
                      className="block truncate text-sm font-medium text-black hover:underline"
                    >
                      {item.title}
                    </Link>
                    {item.notes && (
                      <p className="truncate text-[11px] text-muted">{item.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-black">
                    {formatDate(`${item.date}T00:00:00`)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted">No important dates yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphical Expenses Analytics & Insights Card (Clickable to /dashboard/expenses) */}
      <ExpenseChart expenses={expenses} interactive={true} />
    </div>
  );
}
