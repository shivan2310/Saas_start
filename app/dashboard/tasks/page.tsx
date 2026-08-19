"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { todoService } from "@/services/todoService";
import { TodoItem, Priority } from "@/types";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Plus, Trash2, Check, Circle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quick add form state
  const [newText, setNewText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

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
      setShowAdd(false);
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
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({ type: "error", title: "Error", description: "Could not delete task." });
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayTodos = todos.filter((t) => !t.done && (!t.dueDate || t.dueDate <= todayStr));
  const upcomingTodos = todos.filter((t) => !t.done && t.dueDate && t.dueDate > todayStr);
  const completedTodos = todos.filter((t) => t.done);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-end justify-between">
        <h2 className="text-[24px] font-semibold tracking-tight text-dash-text">To-dos</h2>
      </div>

      {/* Quick Add Toggle */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-[14px] font-medium text-dash-text-secondary hover:text-dash-text transition-colors"
        >
          <Plus className="h-4 w-4" /> Add task
        </button>
      ) : (
        <form onSubmit={handleAddTodo} className="bg-dash-card border border-dash-border rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Task description..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="w-full bg-transparent border-none text-[14px] text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-0"
            autoFocus
          />
          <div className="flex flex-wrap gap-3 items-center justify-between pt-2 border-t border-dash-border">
            <div className="flex items-center gap-3">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="bg-transparent text-[12px] font-medium text-dash-text-secondary cursor-pointer focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-[12px] font-medium text-dash-text-secondary cursor-pointer focus:outline-none"
                title="Due Date"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="dash-ghost" size="dash-sm" onClick={() => setShowAdd(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="dash-primary" size="dash-sm" isLoading={isAdding}>
                Add Task
              </Button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-[13px] text-dash-text-muted">Loading tasks...</div>
      ) : (
        <div className="space-y-8">
          {/* Today */}
          {(todayTodos.length > 0 || todos.length === 0) && (
            <div className="space-y-3">
              <h3 className="text-[14px] font-medium text-dash-text-muted border-b border-dash-border pb-2">Today</h3>
              {todayTodos.length === 0 ? (
                <p className="text-[13px] text-dash-text-muted py-2">No tasks for today.</p>
              ) : (
                <div className="space-y-1">
                  {todayTodos.map(todo => (
                    <TaskRow key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming */}
          {upcomingTodos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[14px] font-medium text-dash-text-muted border-b border-dash-border pb-2">Upcoming</h3>
              <div className="space-y-1">
                {upcomingTodos.map(todo => (
                  <TaskRow key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTodos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[14px] font-medium text-dash-text-muted border-b border-dash-border pb-2">Completed</h3>
              <div className="space-y-1">
                {completedTodos.map(todo => (
                  <TaskRow key={todo.id} todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({ todo, onToggle, onDelete }: { todo: TodoItem, onToggle: (id: string, done: boolean) => void, onDelete: (id: string) => void }) {
  return (
    <div className="group flex items-center justify-between py-2 -mx-2 px-2 rounded-md hover:bg-dash-hover transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => onToggle(todo.id, todo.done)}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
            todo.done 
              ? "bg-dash-accent border-dash-accent text-dash-background" 
              : "border-dash-border hover:border-dash-text text-transparent"
          )}
        >
          {todo.done && <Check className="h-3 w-3" strokeWidth={3} />}
        </button>
        <span className={cn(
          "text-[14px] truncate transition-colors",
          todo.done ? "text-dash-text-muted" : "text-dash-text"
        )}>
          {todo.text}
        </span>
      </div>
      
      <div className="flex items-center gap-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {todo.priority !== "medium" && (
          <span className={cn(
            "text-[11px] font-medium px-1.5 py-0.5 rounded",
            todo.priority === "high" ? "bg-dash-elevated text-dash-text" : "text-dash-text-muted"
          )}>
            {todo.priority}
          </span>
        )}
        {todo.dueDate && (
          <span className="flex items-center gap-1.5 text-[12px] text-dash-text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            {new Date(`${todo.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
        <button 
          onClick={() => onDelete(todo.id)}
          className="text-dash-text-muted hover:text-dash-text transition-colors p-1"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
