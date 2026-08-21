"use client";

import { FormEvent, useEffect, useState } from "react";
import { Trash2, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { personalService } from "@/services/personalService";
import { ImportantDate } from "@/types";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function DatesPage() {
  const { user } = useAuth(); 
  const [items, setItems] = useState<ImportantDate[]>([]); 
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState(""); 
  const [date, setDate] = useState(""); 
  const [notes, setNotes] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { 
    if (user) {
      personalService.getDates(user.uid).then(data => {
        setItems(data.sort((a, b) => a.date.localeCompare(b.date)));
        setLoading(false);
      });
    }
  }, [user]);

  const submit = async (e: FormEvent) => { 
    e.preventDefault(); 
    if (!user || !title.trim() || !date) return; 
    
    setIsSubmitting(true);
    try {
      const item = await personalService.addDate(user.uid, title.trim(), date, notes.trim()); 
      setItems((v) => [...v, item].sort((a, b) => a.date.localeCompare(b.date))); 
      setTitle(""); 
      setDate(""); 
      setNotes(""); 
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string) => { 
    await personalService.remove("importantDates", id); 
    setItems((v) => v.filter((item) => item.id !== id)); 
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  // Mark days with events
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const eventsThisMonth = items.filter(item => item.date.startsWith(monthStr));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h2 className="text-[28px] font-semibold tracking-tight text-dash-text">Important Dates</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Col: Calendar (Minimal Monochrome) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-lg border border-dash-border bg-dash-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-dash-text">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex items-center gap-1">
                <button onClick={prevMonth} className="p-1 hover:bg-dash-hover rounded text-dash-text-muted hover:text-dash-text transition-dash">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={nextMonth} className="p-1 hover:bg-dash-hover rounded text-dash-text-muted hover:text-dash-text transition-dash">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {padding.map(i => (
                <div key={`empty-${i}`} className="h-8" />
              ))}
              {days.map(day => {
                const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
                const hasEvent = eventsThisMonth.some(e => e.date === dateStr);
                const isToday = dateStr === new Date().toISOString().split('T')[0];

                return (
                  <div 
                    key={day} 
                    className={cn(
                      "h-8 flex items-center justify-center text-[12px] rounded-full transition-dash cursor-default",
                      hasEvent ? "bg-dash-accent-bg text-dash-text font-semibold border border-dash-accent/30" : "text-dash-text-secondary hover:bg-dash-hover",
                      isToday && !hasEvent && "border border-dash-text text-dash-text font-semibold"
                    )}
                    title={eventsThisMonth.filter(e => e.date === dateStr).map(e => e.title).join(', ')}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Date Form */}
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-[14px] font-medium text-dash-text-secondary hover:text-dash-text transition-dash"
            >
              <Plus className="h-4 w-4" /> Add a date
            </button>
          ) : (
            <form onSubmit={submit} className="bg-dash-card border border-dash-border rounded-lg p-4 space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="What is it? (e.g. Birthday, Appointment)"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-b border-dash-border text-[14px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-accent focus:outline-none py-1"
                  autoFocus
                  required
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent border-b border-dash-border text-[14px] text-dash-text-secondary focus:border-dash-accent focus:outline-none py-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent border-b border-dash-border text-[14px] text-dash-text placeholder:text-dash-text-muted focus:border-dash-accent focus:outline-none py-1"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="dash-ghost" size="dash-sm" onClick={() => setShowAdd(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="dash-primary" size="dash-sm" isLoading={isSubmitting}>
                  Save
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Right Col: List */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-dash-border bg-dash-card p-5 space-y-4">
            <h3 className="text-[14px] font-medium text-dash-text-muted border-b border-dash-border pb-2">Upcoming Dates</h3>
            
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-10 w-1/2" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-[13px] text-dash-text-muted py-4">No important dates recorded.</div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="group flex items-start justify-between py-3 px-3 -mx-3 hover:bg-dash-hover rounded-lg transition-dash border-l-2 border-transparent hover:border-dash-accent">
                    <div className="flex flex-col gap-1 pr-4">
                      <span className="text-[15px] font-medium text-dash-text">{item.title}</span>
                      {item.notes && <span className="text-[13px] text-dash-text-muted">{item.notes}</span>}
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="flex items-center gap-1.5 text-[13px] font-medium text-dash-text-secondary bg-dash-surface border border-dash-border px-2.5 py-1 rounded">
                        <CalendarIcon className="h-3 w-3" />
                        {item.date}
                      </span>
                      <button 
                        onClick={() => remove(item.id)}
                        className="text-dash-text-muted hover:text-dash-text opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
