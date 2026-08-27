"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { todoService } from "@/services/todoService";
import { TodoItem, Priority } from "@/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Trash2, 
  Check, 
  Search, 
  Pencil, 
  ChevronDown, 
  X,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "today" | "upcoming" | "overdue" | "completed";
type SortOption = "dueDate" | "priority" | "createdAt";

function getLocalDateStr(d?: Date) {
  const date = d || new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const PRIORITY_WEIGHTS = { high: 3, medium: 2, low: 1 };

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("dueDate");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [modalText, setModalText] = useState("");
  const [modalPriority, setModalPriority] = useState<Priority>("medium");
  const [modalDueDate, setModalDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadTodos();
  }, [user]);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const data = await todoService.getUserTodos(user!.uid);
      setTodos(data);
    } catch (error) {
      toast({ type: "error", title: "Error", description: "Failed to load tasks." });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTodo(null);
    setModalText("");
    setModalPriority("medium");
    setModalDueDate("");
    setIsModalOpen(true);
  };

  const openEditModal = (todo: TodoItem) => {
    setEditingTodo(todo);
    setModalText(todo.text);
    setModalPriority(todo.priority);
    setModalDueDate(todo.dueDate || "");
    setIsModalOpen(true);
  };

  const closeModals = () => {
    setIsModalOpen(false);
    setDeletingId(null);
  };

  const handleSaveTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalText.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      if (editingTodo) {
        await todoService.updateTodo(editingTodo.id, {
          text: modalText.trim(),
          priority: modalPriority,
          dueDate: modalDueDate || null
        });
        setTodos(prev => prev.map(t => t.id === editingTodo.id ? { ...t, text: modalText.trim(), priority: modalPriority, dueDate: modalDueDate || null } : t));
      } else {
        const created = await todoService.addTodo(user.uid, modalText.trim(), modalPriority, modalDueDate || undefined);
        setTodos(prev => [created, ...prev]);
      }
      closeModals();
    } catch (error) {
      toast({ type: "error", title: "Error", description: "Failed to save task." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentDone: boolean) => {
    try {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !currentDone } : t));
      await todoService.toggleTodo(id, !currentDone);
    } catch (error) {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, done: currentDone } : t));
      toast({ type: "error", title: "Error", description: "Update failed." });
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const id = deletingId;
    try {
      setTodos(prev => prev.filter(t => t.id !== id));
      await todoService.deleteTodo(id);
    } catch (error) {
      toast({ type: "error", title: "Error", description: "Delete failed." });
      loadTodos();
    } finally {
      closeModals();
    }
  };

  const todayStr = getLocalDateStr();

  const filteredAndSortedTodos = useMemo(() => {
    let result = todos.filter(t => {
      if (search) {
        if (!t.text.toLowerCase().includes(search.toLowerCase())) return false;
      }
      if (filter === "completed") return t.done;
      if (filter === "overdue") return !t.done && t.dueDate && t.dueDate < todayStr;
      if (filter === "today") return !t.done && (!t.dueDate || t.dueDate === todayStr);
      if (filter === "upcoming") return !t.done && t.dueDate && t.dueDate > todayStr;
      return true; // "all"
    });

    result.sort((a, b) => {
      if (sort === "priority") return PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      if (sort === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      
      // dueDate sorting (default): overdue first, then today, then upcoming, then no due date
      const aDate = a.dueDate ? a.dueDate : "9999-99-99";
      const bDate = b.dueDate ? b.dueDate : "9999-99-99";
      return aDate.localeCompare(bDate);
    });

    return result;
  }, [todos, filter, search, sort, todayStr]);

  // Grouping for "all" or search view
  const groupedTodos = useMemo(() => {
    const groups = {
      overdue: [] as TodoItem[],
      today: [] as TodoItem[],
      upcoming: [] as TodoItem[],
      completed: [] as TodoItem[]
    };
    
    filteredAndSortedTodos.forEach(t => {
      if (t.done) {
        groups.completed.push(t);
      } else if (t.dueDate && t.dueDate < todayStr) {
        groups.overdue.push(t);
      } else if (!t.dueDate || t.dueDate === todayStr) {
        groups.today.push(t);
      } else {
        groups.upcoming.push(t);
      }
    });
    
    return groups;
  }, [filteredAndSortedTodos, todayStr]);

  const renderTaskRow = (todo: TodoItem) => (
    <div key={todo.id} className="group flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-dash-border/40 last:border-0 hover:bg-dash-hover/30 transition-dash px-3 -mx-3 rounded-lg gap-2 sm:gap-4">
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <button
          onClick={() => handleToggle(todo.id, todo.done)}
          className={cn(
            "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border transition-dash focus-dash mt-0.5 sm:mt-0",
            todo.done 
              ? "bg-dash-accent border-dash-accent text-dash-background" 
              : "border-dash-border-secondary hover:border-dash-text text-transparent"
          )}
          aria-label={todo.done ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </button>
        <div className="flex flex-col min-w-0 flex-1">
          <span 
            className={cn(
              "text-[14px] leading-snug sm:leading-normal transition-dash cursor-pointer select-none",
              todo.done ? "text-dash-text-muted line-through" : "text-dash-text",
              !todo.done && "font-medium"
            )}
            onClick={() => handleToggle(todo.id, todo.done)}
          >
            {todo.text}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-4 pl-[32px] sm:pl-0 w-full sm:w-auto shrink-0">
        <div className="flex items-center gap-3">
          {todo.priority !== "medium" && !todo.done && (
            <span className={cn(
              "text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-[3px]",
              todo.priority === "high" ? "text-red-400 bg-red-400/10" : "text-dash-text-muted bg-dash-surface"
            )}>
              {todo.priority}
            </span>
          )}
          
          {todo.dueDate && !todo.done && (
            <span className={cn(
              "text-[12px]",
              todo.dueDate < todayStr ? "text-red-400 font-medium" :
              todo.dueDate === todayStr ? "text-dash-accent" : "text-dash-text-muted"
            )}>
              {todo.dueDate < todayStr ? `Overdue · ${formatShortDate(todo.dueDate)}` : 
               todo.dueDate === todayStr ? "Today" : formatShortDate(todo.dueDate)}
            </span>
          )}
          {todo.done && todo.dueDate && (
            <span className="text-[12px] text-dash-text-disabled">
              {formatShortDate(todo.dueDate)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button onClick={() => openEditModal(todo)} className="p-1.5 text-dash-text-muted hover:text-dash-text transition-dash rounded-md hover:bg-dash-surface" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeletingId(todo.id)} className="p-1.5 text-dash-text-muted hover:text-red-400 transition-dash rounded-md hover:bg-dash-surface" aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  function formatShortDate(dStr: string) {
    const d = new Date(`${dStr}T00:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const allEmpty = todos.length === 0;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-dash-text leading-tight">To-dos</h1>
          <p className="text-[14px] text-dash-text-secondary mt-1">Stay on top of what needs to get done.</p>
        </div>
        {!allEmpty && (
          <Button onClick={openAddModal} className="h-9 px-4 shrink-0 shadow-sm" variant="dash-primary">
            <Plus className="h-4 w-4 mr-1.5" />
            Add task
          </Button>
        )}
      </div>

      {allEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h2 className="text-[15px] font-medium text-dash-text mb-2">You're all caught up.</h2>
          <p className="text-[13px] text-dash-text-muted mb-6">Create a task when something needs to get done.</p>
          <Button onClick={openAddModal} variant="dash-primary" className="h-9 px-4">
            <Plus className="h-4 w-4 mr-1.5" /> Add task
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-dash-border">
            <div className="flex flex-wrap items-center gap-1 -ml-2">
              {(["all", "today", "upcoming", "overdue", "completed"] as FilterTab[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-medium rounded-md transition-dash capitalize",
                    filter === f ? "text-dash-text bg-dash-hover/50" : "text-dash-text-secondary hover:text-dash-text hover:bg-dash-hover/30"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dash-text-muted" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-[220px] bg-transparent border border-dash-border rounded-md pl-9 pr-3 py-1.5 text-[13px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-accent focus:outline-none transition-dash"
                />
              </div>
              <div className="relative w-full sm:w-auto">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="w-full sm:w-auto appearance-none bg-transparent border border-dash-border rounded-md pl-3 pr-8 py-1.5 text-[13px] text-dash-text-secondary cursor-pointer focus:border-dash-accent focus:outline-none transition-dash"
                >
                  <option value="dueDate">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="createdAt">Sort by Newest</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-dash-text-muted pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Task Lists */}
          <div className="space-y-10 pt-2">
            {filteredAndSortedTodos.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-[13px] text-dash-text-muted">No tasks found.</p>
                {(search || filter !== "all") && (
                  <button onClick={() => { setSearch(""); setFilter("all"); }} className="mt-3 text-[13px] text-dash-accent hover:text-dash-accent-hover transition-dash">
                    Clear filters
                  </button>
                )}
              </div>
            ) : filter === "all" || search ? (
              <>
                {groupedTodos.overdue.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-3 pl-1">Overdue</h3>
                    <div>{groupedTodos.overdue.map(renderTaskRow)}</div>
                  </div>
                )}
                {groupedTodos.today.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-dash-text-muted uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                      Today <span className="px-1.5 py-0.5 rounded-sm bg-dash-surface text-[10px] text-dash-text-secondary">{groupedTodos.today.length}</span>
                    </h3>
                    <div>{groupedTodos.today.map(renderTaskRow)}</div>
                  </div>
                )}
                {groupedTodos.upcoming.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-dash-text-muted uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                      Upcoming <span className="px-1.5 py-0.5 rounded-sm bg-dash-surface text-[10px] text-dash-text-secondary">{groupedTodos.upcoming.length}</span>
                    </h3>
                    <div>{groupedTodos.upcoming.map(renderTaskRow)}</div>
                  </div>
                )}
                {groupedTodos.completed.length > 0 && (
                  <div className="opacity-80">
                    <h3 className="text-[11px] font-semibold text-dash-text-muted uppercase tracking-wider mb-3 pl-1 flex items-center gap-2">
                      Completed <span className="px-1.5 py-0.5 rounded-sm bg-dash-surface text-[10px] text-dash-text-secondary">{groupedTodos.completed.length}</span>
                    </h3>
                    <div>{groupedTodos.completed.map(renderTaskRow)}</div>
                  </div>
                )}
              </>
            ) : (
              <div>
                {filteredAndSortedTodos.map(renderTaskRow)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dash-border">
              <h3 className="text-[15px] font-medium text-dash-text">{editingTodo ? "Edit task" : "Add task"}</h3>
              <button onClick={closeModals} className="text-dash-text-muted hover:text-dash-text transition-dash p-1.5 rounded-md hover:bg-dash-hover">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveTodo} className="p-5 space-y-5">
              <div>
                <label className="block text-[12px] font-medium text-dash-text-secondary mb-1.5">Task Description</label>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={modalText}
                  onChange={(e) => setModalText(e.target.value)}
                  className="w-full bg-dash-background border border-dash-border rounded-lg px-3 py-2.5 text-[14px] text-dash-text placeholder:text-dash-text-disabled focus:border-dash-accent focus:outline-none transition-dash"
                  autoFocus
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[12px] font-medium text-dash-text-secondary mb-1.5">Priority</label>
                  <div className="relative">
                    <select
                      value={modalPriority}
                      onChange={(e) => setModalPriority(e.target.value as Priority)}
                      className="w-full appearance-none bg-dash-background border border-dash-border rounded-lg px-3 py-2.5 text-[13px] text-dash-text focus:border-dash-accent focus:outline-none transition-dash cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dash-text-muted pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-dash-text-secondary mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={modalDueDate}
                    onChange={(e) => setModalDueDate(e.target.value)}
                    className="w-full bg-dash-background border border-dash-border rounded-lg px-3 py-2.5 text-[13px] text-dash-text focus:border-dash-accent focus:outline-none transition-dash"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-5 border-t border-dash-border">
                <Button type="button" variant="dash-ghost" onClick={closeModals}>Cancel</Button>
                <Button type="submit" variant="dash-primary" isLoading={isSubmitting}>{editingTodo ? "Save changes" : "Create task"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-500/10 rounded-full text-red-400 shrink-0">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="pt-0.5">
                  <h3 className="text-[15px] font-medium text-dash-text">Delete task?</h3>
                  <p className="text-[13px] text-dash-text-secondary mt-1.5">This action cannot be undone. Are you sure you want to remove this task permanently?</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-dash-border">
                <Button type="button" variant="dash-ghost" onClick={closeModals}>Cancel</Button>
                <Button type="button" onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white border-transparent">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
