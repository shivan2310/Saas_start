"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { todoService } from "@/services/todoService";
import { TodoItem, Priority } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, CheckCircle2, Circle, Clock, CheckSquare, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadTodos();
  }, [user]);

  const loadTodos = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await todoService.getUserTodos(user.uid);
      setTodos(data);
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast({ type: "error", title: "Error", description: "Failed to load task list." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !user) return;

    setIsAdding(true);
    try {
      const created = await todoService.addTodo(user.uid, newText.trim(), priority, dueDate);
      setTodos((prev) => [created, ...prev]);
      setNewText("");
      setDueDate("");
      toast({ type: "success", title: "Task Added", description: "Task saved to database." });
    } catch (error) {
      console.error("Failed to add task:", error);
      toast({ type: "error", title: "Error", description: "Could not save task." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string, currentDone: boolean) => {
    try {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !currentDone } : t))
      );
      await todoService.toggleTodo(id, !currentDone);
    } catch (error) {
      console.error("Failed to toggle task:", error);
      // Revert on error
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: currentDone } : t))
      );
      toast({ type: "error", title: "Error", description: "Could not update task." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      await todoService.deleteTodo(id);
      toast({ type: "success", title: "Deleted", description: "Task removed." });
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({ type: "error", title: "Error", description: "Could not delete task." });
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  const totalCount = todos.length;
  const activeCount = todos.filter((t) => !t.done).length;
  const completedCount = todos.filter((t) => t.done).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-black">Tasks & Todo List</h2>
        <p className="text-xs text-muted mt-1">
          Manage your personal tasks stored securely in your Supabase database.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
              Total Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
              Pending
            </CardTitle>
            <Clock className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 mb-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Input Card */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleAddTodo} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full">
              <Input
                placeholder="Add a new task..."
                maxLength={500}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="text-base"
              />
            </div>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-10 px-3 rounded border border-border bg-white text-xs font-medium text-black focus:outline-none focus:ring-1 focus:ring-black w-full sm:w-auto"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Input
              aria-label="Due date"
              title="Due date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full sm:w-auto"
            />
            <Button type="submit" isLoading={isAdding} className="w-full sm:w-auto shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex w-full items-center gap-2 overflow-x-auto border-b border-border pb-3">
        {(["all", "active", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded text-xs font-medium capitalize transition-colors",
              filter === f
                ? "bg-black text-white"
                : "text-muted hover:text-black hover:bg-surface"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center text-xs text-muted font-mono uppercase tracking-wider">
            Loading tasks...
          </div>
        ) : filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm font-medium text-black">No tasks found</p>
              <p className="text-xs text-muted mt-1">
                {filter === "all"
                  ? "You have no tasks yet. Add one above!"
                  : `No ${filter} tasks right now.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-center justify-between p-4 rounded border border-border bg-white transition-all hover:border-black",
                todo.done && "opacity-60 bg-surface"
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(todo.id, todo.done)}
                  className="text-black hover:opacity-75 transition-opacity shrink-0"
                >
                  {todo.done ? (
                    <CheckCircle2 className="h-5 w-5 text-black" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted" />
                  )}
                </button>

                <span
                  className={cn(
                    "text-base text-black font-medium break-all",
                    todo.done && "line-through text-muted"
                  )}
                >
                  {todo.text}
                </span>

                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ml-2 shrink-0",
                    todo.priority === "high" && "border-black bg-black text-white",
                    todo.priority === "medium" && "border-border bg-surface text-black",
                    todo.priority === "low" && "border-border text-muted"
                  )}
                >
                  {todo.priority}
                </span>
                {todo.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-muted shrink-0">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {new Date(`${todo.dueDate}T00:00:00`).toLocaleDateString()}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleDelete(todo.id)}
                className="p-1.5 text-muted hover:text-black hover:bg-surface rounded transition-colors ml-2 shrink-0"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
